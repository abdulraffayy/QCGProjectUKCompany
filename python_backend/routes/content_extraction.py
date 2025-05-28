"""
Content extraction API routes for file uploads and website processing
Supports PDF, documents, images (OCR), and website content extraction
"""
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, HttpUrl
import os
import tempfile
import mimetypes
from database import get_db

router = APIRouter()

class WebsiteExtractionRequest(BaseModel):
    url: HttpUrl

class ContentExtractionResponse(BaseModel):
    extracted_text: str
    file_count: int
    processing_method: str
    metadata: dict

@router.post("/extract-content", response_model=ContentExtractionResponse)
async def extract_content_from_files(
    files: List[UploadFile] = File(...),
    source_type: str = Form(...),
    db: Session = Depends(get_db)
):
    """Extract text content from uploaded files"""
    
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    extracted_texts = []
    metadata = {
        "files_processed": [],
        "total_size_mb": 0,
        "processing_errors": []
    }
    
    for file in files:
        try:
            # Validate file size (50MB limit)
            content = await file.read()
            file_size_mb = len(content) / (1024 * 1024)
            
            if file_size_mb > 50:
                metadata["processing_errors"].append(f"{file.filename}: File too large (>50MB)")
                continue
            
            metadata["total_size_mb"] += file_size_mb
            
            # Determine file type and extract accordingly
            file_type, _ = mimetypes.guess_type(file.filename)
            
            extracted_text = ""
            processing_method = "unknown"
            
            if source_type == "pdf" and file_type == "application/pdf":
                extracted_text, processing_method = await extract_from_pdf(content, file.filename)
            elif source_type == "pdf" and file_type in ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
                extracted_text, processing_method = await extract_from_document(content, file.filename)
            elif source_type == "pdf" and file_type == "text/plain":
                extracted_text = content.decode('utf-8', errors='ignore')
                processing_method = "plain_text"
            elif source_type == "scanned_doc" and file_type and file_type.startswith("image/"):
                extracted_text, processing_method = await extract_from_image_ocr(content, file.filename)
            else:
                # Fallback: try to read as text
                try:
                    extracted_text = content.decode('utf-8', errors='ignore')
                    processing_method = "text_fallback"
                except:
                    metadata["processing_errors"].append(f"{file.filename}: Unsupported file type or corrupted")
                    continue
            
            if extracted_text.strip():
                extracted_texts.append(f"=== {file.filename} ===\n{extracted_text}\n")
                metadata["files_processed"].append({
                    "filename": file.filename,
                    "size_mb": round(file_size_mb, 2),
                    "type": file_type or "unknown",
                    "method": processing_method,
                    "text_length": len(extracted_text)
                })
            
        except Exception as e:
            metadata["processing_errors"].append(f"{file.filename}: {str(e)}")
    
    if not extracted_texts:
        raise HTTPException(status_code=400, detail="No text could be extracted from uploaded files")
    
    final_text = "\n\n".join(extracted_texts)
    
    return ContentExtractionResponse(
        extracted_text=final_text,
        file_count=len(metadata["files_processed"]),
        processing_method=source_type,
        metadata=metadata
    )

@router.post("/extract-website", response_model=ContentExtractionResponse)
async def extract_website_content(
    request: WebsiteExtractionRequest,
    db: Session = Depends(get_db)
):
    """Extract content from website URL"""
    
    try:
        url = str(request.url)
        extracted_text, metadata = await extract_from_website(url)
        
        return ContentExtractionResponse(
            extracted_text=extracted_text,
            file_count=1,
            processing_method="website_extraction",
            metadata=metadata
        )
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract website content: {str(e)}")

# Content extraction helper functions
async def extract_from_pdf(content: bytes, filename: str) -> tuple[str, str]:
    """Extract text from PDF using PyPDF2 or similar"""
    try:
        import PyPDF2
        import io
        
        pdf_file = io.BytesIO(content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text_content = []
        for page in pdf_reader.pages:
            text_content.append(page.extract_text())
        
        return "\n".join(text_content), "pypdf2"
    
    except ImportError:
        # Fallback if PyPDF2 not available
        return f"PDF content from {filename} (text extraction requires PyPDF2 library)", "fallback"
    except Exception as e:
        return f"Error extracting PDF {filename}: {str(e)}", "error"

async def extract_from_document(content: bytes, filename: str) -> tuple[str, str]:
    """Extract text from Word documents"""
    try:
        import python_docx2txt
        import io
        
        text = python_docx2txt.process(io.BytesIO(content))
        return text, "docx2txt"
    
    except ImportError:
        return f"Document content from {filename} (text extraction requires python-docx2txt library)", "fallback"
    except Exception as e:
        return f"Error extracting document {filename}: {str(e)}", "error"

async def extract_from_image_ocr(content: bytes, filename: str) -> tuple[str, str]:
    """Extract text from images using OCR"""
    try:
        import pytesseract
        from PIL import Image
        import io
        
        image = Image.open(io.BytesIO(content))
        extracted_text = pytesseract.image_to_string(image)
        
        return extracted_text, "tesseract_ocr"
    
    except ImportError:
        return f"Image content from {filename} (OCR requires pytesseract and PIL libraries)", "fallback"
    except Exception as e:
        return f"Error performing OCR on {filename}: {str(e)}", "error"

async def extract_from_website(url: str) -> tuple[str, dict]:
    """Extract content from website URL"""
    try:
        import requests
        from bs4 import BeautifulSoup
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Extract title
        title = soup.find('title')
        title_text = title.get_text().strip() if title else "No title"
        
        # Extract main content
        # Try to find main content areas
        content_selectors = [
            'main', 'article', '.content', '#content', 
            '.post-content', '.entry-content', '.article-content'
        ]
        
        main_content = None
        for selector in content_selectors:
            main_content = soup.select_one(selector)
            if main_content:
                break
        
        if not main_content:
            main_content = soup.find('body')
        
        text_content = main_content.get_text() if main_content else soup.get_text()
        
        # Clean up text
        lines = (line.strip() for line in text_content.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        clean_text = '\n'.join(chunk for chunk in chunks if chunk)
        
        # Combine title and content
        final_text = f"Title: {title_text}\n\nContent:\n{clean_text}"
        
        metadata = {
            "url": url,
            "title": title_text,
            "content_length": len(clean_text),
            "status_code": response.status_code,
            "content_type": response.headers.get('content-type', 'unknown')
        }
        
        return final_text, metadata
    
    except ImportError:
        raise Exception("Website extraction requires requests and beautifulsoup4 libraries")
    except Exception as e:
        raise Exception(f"Failed to extract website content: {str(e)}")