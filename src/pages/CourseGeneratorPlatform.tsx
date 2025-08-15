import { useState, useEffect } from 'react';
import { Sparkles, Target, Palette, FileText, Edit, Trash2, BookOpen, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { CourseType, courseTypes } from '../types/courseTypes';
import { CourseTypeCard } from '../pages/CourseTypeCard';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const CourseGeneratorPlatform = () => {
  const [, setLocation] = useLocation();
  const [courses, setCourses] = useState<{ id: string, title: string, description?: string, status?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<{ id: string, title: string } | null>(null);
  const [editingCourse, setEditingCourse] = useState<{ id: string, title: string, description: string, status: string } | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'Active'
  });

  // Data table states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'title' | 'description' | 'status'>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleSelectCourseType = (courseType: CourseType) => {
    setLocation(`/course-generator/wizard/${courseType.id}`);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/courses', {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        });
        if (!res.ok) throw new Error('Failed to fetch courses');
        const data = await res.json();
        const coursesData = Array.isArray(data) ? data : [];
        setCourses(coursesData);
        console.log("Courses loaded:", coursesData);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleEditCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setEditingCourse({
        id: course.id,
        title: course.title,
        description: course.description || '',
        status: course.status || 'Active'
      });
      setEditForm({
        title: course.title,
        description: course.description || '',
        status: course.status || 'Active'
      });
      setShowEditPopup(true);
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;

    try {
      const token = localStorage.getItem('token');
      const userid = localStorage.getItem('userid') || '1'; 
      
      const response = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          status: editForm.status,
          userid: userid
        })
      });

      if (response.ok) {
       
        setCourses(prev => prev.map(course => 
          course.id === editingCourse.id 
            ? { ...course, title: editForm.title, description: editForm.description, status: editForm.status }
            : course
        ));
       
        setShowEditPopup(false);
        setEditingCourse(null);
        setEditForm({ title: '', description: '', status: 'active' });
        
        console.log('Course updated successfully');
      } else {
        console.error('Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleCancelEdit = () => {
    setShowEditPopup(false);
    setEditingCourse(null);
    setEditForm({ title: '', description: '', status: 'Active' });
  };

  const handleDeleteCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setDeletingCourse({
        id: course.id,
        title: course.title
      });
      setShowDeletePopup(true);
    }
  };

  const confirmDeleteCourse = async () => {
    if (!deletingCourse) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses/${deletingCourse.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      if (res.ok) {
        setCourses(prev => prev.filter(course => course.id !== deletingCourse.id));
        console.log('Course deleted successfully');
      } else {
        console.error('Failed to delete course');
      }
    } catch (err) {
      console.error("Error deleting course:", err);
    } finally {
      setShowDeletePopup(false);
      setDeletingCourse(null);
    }
  };

  const cancelDeleteCourse = () => {
    setShowDeletePopup(false);
    setDeletingCourse(null);
  };

  // Data table utility functions
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (course.status && course.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    if (sortDirection === 'asc') {
      return aValue.toString().localeCompare(bValue.toString());
    } else {
      return bValue.toString().localeCompare(aValue.toString());
    }
  });

  const totalPages = Math.ceil(sortedCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = sortedCourses.slice(startIndex, endIndex);

  const handleSort = (field: 'title' | 'description' | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: 'title' | 'description' | 'status' }) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 text-blue-600" /> : 
      <ChevronDown className="h-4 w-4 text-blue-600" />;
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Course Generator Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Create professional, engaging courses with AI-powered templates tailored to your specific needs
          </p>
        </div>
      </div>

      {(
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Course Type
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the format that best matches your educational goals and audience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courseTypes.map((courseType) => (
              <CourseTypeCard
                key={courseType.id}
                courseType={courseType}
                onSelect={handleSelectCourseType}
                isExpanded={false}
              />
            ))}
          </div>
        </div>
      )}

      
      <div className="bg-gray-50 py-16">
        <div className="w-full px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              My Courses
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage and edit your created courses
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-500">No courses yet</p>
              <p className="text-sm text-gray-400">Create your first course to see it here</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border w-full">
              {/* Search and Controls */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="items-per-page" className="text-sm text-gray-600">Show:</Label>
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-1/4"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center gap-2">
                          Title
                          <SortIcon field="title" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-2/5"
                        onClick={() => handleSort('description')}
                      >
                        <div className="flex items-center gap-2">
                          Description
                          <SortIcon field="description" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-1/6"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          <SortIcon field="status" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{course.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-md">
                            {course.description || 'No description'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            course.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {course.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCourse(course.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCourse(course.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {startIndex + 1} to {Math.min(endIndex, sortedCourses.length)} of {sortedCourses.length} results
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="h-8 w-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Professional Templates
              </h3>
              <p className="text-gray-600">
                AI-powered templates based on educational best practices and industry standards
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Palette className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Customizable Content
              </h3>
              <p className="text-gray-600">
                Tailor every aspect to your specific audience, objectives, and requirements
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Multiple Formats
              </h3>
              <p className="text-gray-600">
                Export to PDF, HTML, presentation slides, and more for maximum flexibility
              </p>
            </div>
          </div>
        </div>
      </div>

     
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Sparkles className="h-4 w-4" />
            <span>Made with Manus</span>
          </div>
        </div>
             </div>
     </div>

          
      {showEditPopup && editingCourse && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCancelEdit}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
                       <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 text-center">Edit Course</h3>
            </div>

           <div className="space-y-4">
             <div>
               <Label htmlFor="edit-title">Title</Label>
               <Input
                 id="edit-title"
                 value={editForm.title}
                 onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                 placeholder="Enter course title"
               />
             </div>

             <div>
               <Label htmlFor="edit-description">Description</Label>
               <Textarea
                 id="edit-description"
                 value={editForm.description}
                 onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                 placeholder="Enter course description"
                 rows={3}
               />
             </div>

             <div>
               <Label htmlFor="edit-status">Status</Label>
                               <Select
                  value={editForm.status || "Active"}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Not Active">Not Active</SelectItem>
                  
                  </SelectContent>
                </Select>
             </div>

             <div className="flex justify-end space-x-3 pt-4">
               <Button
                 variant="outline"
                 onClick={handleCancelEdit}
               >
                 Cancel
               </Button>
               <Button
                 onClick={handleUpdateCourse}
                 className="bg-blue-600 hover:bg-blue-700"
               >
                 Update
               </Button>
             </div>
           </div>
         </div>
       </div>
     )}

           {/* Delete Course Confirmation Popup */}
      {showDeletePopup && deletingCourse && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={cancelDeleteCourse}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 text-center">Delete Course</h3>
            </div>

            <div className="space-y-4 w-[500px]">
              <div className="text-center flex flex-col items-center justify-center">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete this Course ID: <span className="font-mono text-red-700">{deletingCourse.id}</span>
                </p>
              </div>

             <div className="flex justify-end space-x-3 pt-4">
               <Button
                 variant="outline"
                 onClick={cancelDeleteCourse}
               >
                 Cancel
               </Button>
               <Button
                 onClick={confirmDeleteCourse}
                 className="bg-red-600 hover:bg-red-700"
               >
                 Delete
               </Button>
             </div>
           </div>
         </div>
       </div>
     )}
     </>
   )
 }

export default CourseGeneratorPlatform
