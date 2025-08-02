// import drag drop function 

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import React, { useState, useEffect, useRef } from 'react';
// import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
// import { Badge } from '../components/ui/badge';
// import { Separator } from '../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {Edit, Eye, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "../components/ui/dialog";
import JoditEditor from 'jodit-react';
// import { Skeleton } from '../components/ui/skeleton';





const QAQF_LEVELS: { [key: number]: string } = {
  1: 'Entry',
  2: 'Basic',
  3: 'Foundation',
  4: 'Intermediate',
  5: 'Advanced',
  6: 'Specialist',
  7: 'Professional',
  8: 'Expert',
  9: 'Master',
};

export interface SimpleCourse {
  id: string;
  title: string;
}
export interface SimpleWeek {
  id: number;
  title: string;
}
export interface SimpleLesson {
  id: number;
  title: string;
}

const LessonPlanPage: React.FC = () => {
  const editor = useRef(null);

  const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  };







  const [selectedCourse, setSelectedCourse] = useState<string>("");

  const [modules, setModules] = useState<any[]>([]);





  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDialogValue, setEditDialogValue] = useState("");

  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const [editModuleDialogOpen, setEditModuleDialogOpen] = useState(false);
  const [editModuleDialogWeekId, setEditModuleDialogWeekId] = useState<number | null>(null);
  const [editModuleDialogModuleId, setEditModuleDialogModuleId] = useState<number | null>(null);
  const [editModuleDialogTitle, setEditModuleDialogTitle] = useState("");
  const [editModuleDialogScript, setEditModuleDialogScript] = useState("");
  const [editModuleDialogCourseId, setEditModuleDialogCourseId] = useState("");
  const [editModuleDialogUserId, setEditModuleDialogUserId] = useState("");
  const [editModuleDialogType, setEditModuleDialogType] = useState("lecture");
  const [editModuleDialogDuration, setEditModuleDialogDuration] = useState("");
  const [editModuleDialogQAQF, setEditModuleDialogQAQF] = useState(1);
  const [editModuleDialogDescription, setEditModuleDialogDescription] = useState("");
  const [refreshModules, setRefreshModules] = useState<number>(0);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
 

  // Add Module Dialog state
  const [addModuleDialogOpen, setAddModuleDialogOpen] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleType, setNewModuleType] = useState("lecture");
  const [newModuleDuration, setNewModuleDuration] = useState("");
  const [newModuleQAQF, setNewModuleQAQF] = useState(1);
  const [newModuleDescription, setNewModuleDescription] = useState("");
  const [newModuleUserId, setNewModuleUserId] = useState("");
  const [newModuleCourseId, setNewModuleCourseId] = useState("");

  // Add Course Dialog state
  const [addCourseDialogOpen, setAddCourseDialogOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: "",
    userid: "",
    description: "",
    status: "",
  });



  const [addWeeksDialogOpen, setAddWeeksDialogOpen] = useState(false);
  const [addWeeksForm, setAddWeeksForm] = useState({ courseid: '', title: '' });
  const [courses, setCourses] = useState<{ id: string, title: string }[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteModuleDialogOpen, setDeleteModuleDialogOpen] = useState(false);
  const [deleteModuleTarget, setDeleteModuleTarget] = useState<{ weekId: number, moduleId: number } | null>(null);
  const [rightSideEditDialogOpen, setRightSideEditDialogOpen] = useState(false);
  const [rightSideEditModule, setRightSideEditModule] = useState<any>(null);
  const [rightSideEditForm, setRightSideEditForm] = useState({
    title: "",
    type: "lecture",
    duration: "",
    qaqfLevel: 1,
    script: "",
    courseid: "",
    userid: "",
    level: "",
    description: "", 
  });

  const [rightSideDeleteDialogOpen, setRightSideDeleteDialogOpen] = useState(false);
  const [rightSideDeleteModule, setRightSideDeleteModule] = useState<any>(null);

  
  const fetchCoursesFromAPI = async (userid?: string) => {
    try {
      let url = '/api/courses';
      if (userid) {
        url += `?userid=${encodeURIComponent(userid)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();


     
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      
    }
  };


  const fetchModulesFromAPI = async (courseId?: string) => {
    try {
      let url = '/api/lessons';
      if (courseId) {
        url += `?courseid=${encodeURIComponent(courseId)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch lessons');
      const data = await res.json();
      console.log('API returned modules data:', data);
      if (Array.isArray(data) && data.length > 0) {
        console.log('First module data structure:', data[0]);
      }
      setModules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching modules:', err);
     
    }
  };

 
  const handleAddWeekApi = async () => {
    try {
      if (!selectedCourse) {
        toast.error("Please select a course first");
        return;
      }

      const res = await fetch('/api/weeks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: addWeeksForm.title,
          courseid: selectedCourse,
          userid: userId,
        }),
      });
      if (!res.ok) throw new Error('Failed to add week');

      await res.json();

      toast.success("Week added successfully!");

      // Close the dialog and reset form
      setAddDialogOpen(false);
      setAddWeeksForm({ courseid: "", title: "" });

      // Add a small delay to ensure the API has processed the new week
      await new Promise(resolve => setTimeout(resolve, 500));

      // Now fetch weeks for the selected course and update state
      await fetchWeeksFromAPI();

      // Force a re-render by updating the refreshWeeks state
    } catch (err) {
      console.error('Error adding week:', err);
      toast.error("Could not add week. Please try again.");
    }
  };





  // Fetch courses on mount
  useEffect(() => {
    fetchCoursesFromAPI();
  }, []);

  // Fetch modules for the selected course
  useEffect(() => {
    if (selectedCourse) {
      fetchModulesFromAPI(selectedCourse);
    } else {
      setModules([]);
    }
  }, [selectedCourse]);

  // Refresh modules when refreshModules state changes
  useEffect(() => {
    if (selectedCourse && refreshModules > 0) {
      fetchModulesFromAPI(selectedCourse);
    }
  }, [refreshModules, selectedCourse]);

  // Remove localStorage logic for modules and weeks since assignments are now backend-driven






  const handleDialogSave = async () => {
    if (!editDialogValue.trim()) {
      toast.error("Please enter a week title");
      return;
    }

    try {
      // Use the editWeekData that was set when the dialog was opened
      if (!editWeekData) {
        toast.error("Week data not found");
        return;
      }

      const res = await fetch(`/api/weeks/${editWeekData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseid: editWeekData.courseid,
          title: editDialogValue,
        }),
      });

      if (!res.ok) throw new Error('Failed to update week');

      toast.success("Week updated successfully!");
      setEditDialogOpen(false);
      setEditDialogValue("");
      setEditWeekData(null);
      await fetchWeeksFromAPI(); // Refresh weeks from API
    } catch (err) {
      toast.error("Could not update week. Please try again.");
    }
  };












  const handleEditModuleDialogSave = async () => {
    if (editModuleDialogWeekId !== null && editModuleDialogModuleId !== null) {

      
      // Call the API to update the module in the backend
      await handleEditModuleApi(editModuleDialogModuleId);
    }
    setEditModuleDialogOpen(false);
    setEditModuleDialogWeekId(null);
    setEditModuleDialogModuleId(null);
    setEditModuleDialogTitle("");
    setEditModuleDialogScript("");
    setEditModuleDialogCourseId("");
    setEditModuleDialogUserId("");
    setEditModuleDialogType("lecture");
    setEditModuleDialogDuration("");
    setEditModuleDialogQAQF(1);
  };

  // Intra-week drag handlers - REMOVED since we only allow left-to-right dragging

  const handleAddModule = async (newModule: any) => {
    // Prepare the module data with courseid and stripped description
    const moduleWithCourseId = {
      ...newModule,
      description: stripHtml(newModule.description), // Strip HTML tags
      courseid: selectedCourse,
      level: newModule.qaqfLevel, // Send as 'level' to match backend field name
    };
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moduleWithCourseId),
      });
      if (!res.ok) throw new Error('Failed to add module');
      // Get the created module from the response (if your API returns it)
      const createdModule = await res.json();
      // Add the new module to the modules list (left side)
      setModules(prevModules => [
        ...prevModules,
        { ...createdModule, id: createdModule.id || Date.now(), courseid: selectedCourse }
      ]);
      fetchModulesFromAPI(selectedCourse)
      toast.success('Module added successfully!');
    } catch (err) {
      toast.error('Could not add module. Please try again.');
    }
    // Close the dialog and reset form
    setAddModuleDialogOpen(false);
    setNewModuleTitle("");
    setNewModuleType("lecture");
    setNewModuleDuration("");
    setNewModuleQAQF(1);
    setNewModuleDescription("");
    setNewModuleUserId("");
    setNewModuleCourseId("");
  };

  const handleEditModuleApi = async (id: number) => {
    const updatedModule = {
      title: editModuleDialogTitle,
      script: editModuleDialogScript,
      description: stripHtml(editModuleDialogDescription), // Strip HTML tags
      courseid: editModuleDialogCourseId,
      userid: editModuleDialogUserId,
      type: editModuleDialogType,
      duration: editModuleDialogDuration,
      level: editModuleDialogQAQF, // Send as 'level' to match backend field name
    };
    try {
      const res = await fetch(`/api/lessons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedModule),
      });
      if (!res.ok) throw new Error('Failed to update module');

      // Fetch the updated module from the server to get the correct data structure
      const updatedModuleRes = await fetch(`/api/lessons/${id}`);
      if (updatedModuleRes.ok) {
        const serverUpdatedModule = await updatedModuleRes.json();
        console.log('Server returned updated module:', serverUpdatedModule);
        
        // Update the modules state with server data
        setModules(prevModules => 
          prevModules.map(module => 
            module.id === id 
              ? { ...module, ...serverUpdatedModule }
              : module
          )
        );
        

      } else {
        // Fallback: update with payload if server fetch fails
        setModules(prevModules => 
          prevModules.map(module => 
            module.id === id 
              ? { ...module, ...updatedModule }
              : module
          )
        );
        

      }
      
      // Force a re-render to ensure UI updates
      setRefreshModules(prev => prev + 1);
      
      toast.success("Module updated successfully!");
    } catch (err) {
      toast.error("Could not update module. Please try again.");
    }
  };

  // Add function to delete module from backend
  const handleDeleteModuleApi = async (id: number) => {
    try {
      const res = await fetch(`/api/lessons/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete module');
      toast.success('Module deleted successfully!');
      return true;
    } catch (err) {
      toast.error('Could not delete module. Please try again.');
      return false;
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user.userid;





  useEffect(() => {
    if (addCourseDialogOpen && userId) {
      setCourseForm(f => ({ ...f, userid: userId }));
    }
  }, [addCourseDialogOpen, userId]);

  useEffect(() => {
    if (addModuleDialogOpen && userId) {
      setNewModuleUserId(userId);
      setNewModuleCourseId(selectedCourse)
    }
  }, [addModuleDialogOpen, userId]);






  useEffect(() => {
    if (addWeeksDialogOpen && userId) {
      setAddWeeksForm(f => ({ ...f, userid: userId }));
    }
  }, [addWeeksDialogOpen, userId]);

  const distributeModulesToWeeks = () => {
    // Create 12 weeks if not already present
    const weeksCopy = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      title: `Week ${i + 1}`,
      modules: [] as any[],
      isEditing: false,
    }));

    // Distribute modules into weeks (max 4 per week)
    let moduleIndex = 0;
    for (let w = 0; w < 12; w++) {
      weeksCopy[w].modules = modules.slice(moduleIndex, moduleIndex + 4);
      moduleIndex += 4;
    }


    // Optionally clear modules list if you want
    // setModules([]);
    // Optionally persist to localStorage
    localStorage.setItem("weeks", JSON.stringify(weeksCopy));
  };

  const [weeksFromApi, setWeeksFromApi] = useState<any[]>([]);

  const fetchWeeksFromAPI = async () => {
    try {
      const res = await fetch('/api/weeks');
      if (!res.ok) throw new Error('Failed to fetch weeks');
      const data = await res.json();
      setWeeksFromApi(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching weeks:', err);
      setWeeksFromApi([]);
    }
  };

  // Call this in useEffect to load on mount
  useEffect(() => {
    if (selectedCourse) {
      fetchWeeksFromAPI();
    } else {
      setWeeksFromApi([]); // Clear weeks when no course is selected
    }

  }, [selectedCourse]);




















  // Helper: Get unassigned modules (not in any week, only for selected course)
  const getUnassignedModules = () => {
    // Show all modules for the selected course on the left side (keep them visible even if assigned)
    return modules.filter(
      (m) => m.courseid === selectedCourse
    );
  };









  // Function to handle edit module on right side
  const handleEditRightSideModule = (module: any) => {
    setRightSideEditModule(module);
    setRightSideEditForm({
      title: module.title || "",
      type: module.type || "lecture",
      duration: module.duration || "",
      qaqfLevel: module.qaqfLevel || module.level || 1,
      script: module.script || "",
      courseid: module.courseid || "",
      userid: module.userid || "",
      level: module.level || module.qaqfLevel || "",
      description: module.description || "", // <-- YEH LINE ZARUR ADD KAREN
    });
    setRightSideEditDialogOpen(true);
  };

  // Function to handle delete module on right side
  const handleDeleteRightSideModule = (module: any) => {
    setRightSideDeleteModule(module);
    setRightSideDeleteDialogOpen(true);
  };

  // Function to save right side module edit
  const handleSaveRightSideModuleEdit = async () => {
    if (!rightSideEditModule) return;

    try {
      // Build payload with all required fields, including description and level
      const payload = {
        title: rightSideEditForm.title,
        type: rightSideEditForm.type,
        duration: rightSideEditForm.duration,
        qaqfLevel: rightSideEditForm.qaqfLevel,
        level: rightSideEditForm.qaqfLevel, // Send qaqfLevel as level to match backend
        description: stripHtml(rightSideEditForm.description), // Strip HTML tags
        courseid: rightSideEditForm.courseid,
        userid: rightSideEditForm.userid,
        // script: rightSideEditForm.script, // Do NOT include script
      };

      const res = await fetch(`/api/lessons/${rightSideEditModule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), // send only the correct fields
      });

      if (!res.ok) throw new Error('Failed to update module');

      // Fetch the updated module from the server to get the correct data structure
      const updatedModuleRes = await fetch(`/api/lessons/${rightSideEditModule.id}`);
      if (updatedModuleRes.ok) {
        const updatedModule = await updatedModuleRes.json();
        console.log('Server returned updated module:', updatedModule);
        


        // Also update the main modules state with server data
        setModules(prevModules => 
          prevModules.map(module => 
            module.id === rightSideEditModule.id 
              ? { ...module, ...updatedModule }
              : module
          )
        );
      } else {


        setModules(prevModules => 
          prevModules.map(module => 
            module.id === rightSideEditModule.id 
              ? { ...module, ...payload }
              : module
          )
        );
      }

      // Force a re-render to ensure UI updates
      setRefreshModules(prev => prev + 1);
      
      toast.success("Module updated successfully!");
      setRightSideEditDialogOpen(false);
      setRightSideEditModule(null);
    } catch (err) {
      toast.error("Could not update module");
    }
  };

  // Function to delete right side module
  const handleDeleteRightSideModuleConfirm = async () => {
    if (!rightSideDeleteModule) return;

    try {
      const success = await handleDeleteModuleApi(rightSideDeleteModule.id);
      if (success) {


        // Also remove from the modules list (left side) if it exists there
        setModules(prevModules =>
          prevModules.filter(module => module.id !== rightSideDeleteModule.id)
        );

        toast.success("Module deleted!");
        setRightSideDeleteDialogOpen(false);
        setRightSideDeleteModule(null);
      }
    } catch (err) {
      toast.error("Could not delete module");
    }
  };

  // State for editing a week
  const [editWeekDialogOpen, setEditWeekDialogOpen] = useState(false);
  const [editWeekData, setEditWeekData] = useState<any>(null);
  const [deleteWeekDialogOpen, setDeleteWeekDialogOpen] = useState(false);
  const [deleteWeekData, setDeleteWeekData] = useState<any>(null);

  const handleEditWeekSave = async () => {
    if (!editWeekData) return;

    try {
      const res = await fetch(`/api/weeks/${editWeekData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseid: editWeekData.courseid,
          title: editWeekData.title,
          // add other fields as needed
        }),
      });

      if (!res.ok) throw new Error('Failed to update week');

      toast.success("Week updated!");
      setEditWeekDialogOpen(false);
      setEditWeekData(null);
      await fetchWeeksFromAPI(); // Refresh weeks from API for selected course
    } catch (err) {
      toast.error("Could not update week");
    }
  };

  const deleteWeekById = async (id: number) => {
    const res = await fetch(`/api/weeks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete week');
    await fetchWeeksFromAPI(); // Refresh weeks for selected course
  };



  const weeksToShow = selectedCourse
    ? [...weeksFromApi]
      .filter(week => week.courseid === selectedCourse)
      .sort((a, b) => {
        // Sort by creation date, with newest at the end
        const aDate = a.createddate ? new Date(a.createddate).getTime() : (a.id || 0);
        const bDate = b.createddate ? new Date(b.createddate).getTime() : (b.id || 0);
        return aDate - bDate; // Oldest first, newest last
      })
    : []; // Show no weeks when no course is selected


  // Add state for view module dialog


  const [selectedModuleForView, setSelectedModuleForView] = useState<any>(null);



  const moduleDetailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedModuleForView) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        moduleDetailsRef.current &&
        !moduleDetailsRef.current.contains(event.target as Node)
      ) {
        setSelectedModuleForView(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedModuleForView]);

  // In LessonPlanPage component, add this state:
  const [openModuleId, setOpenModuleId] = useState<string | number | null>(null);



  const assignModuleToWeek = async (module: any, week: any) => {

    // Get next order number from backend
    let nextOrderNo = 1;
    try {
      const res = await fetch(`/api/weeklessons/week/${week.id}`);
      if (res.ok) {
        const data = await res.json();
        // Filter for this specific week
        const weekModules = data.filter((item: any) => item.weekid === week.id);

        // Find the highest orderno for this week
        if (weekModules.length > 0) {
          const orderNumbers = weekModules.map((item: any) => {
            return parseInt(item.orderno) || 0;
          });
          const maxOrderNo = Math.max(...orderNumbers);
          nextOrderNo = maxOrderNo + 1;
        } else {
          nextOrderNo = 1;
        }
      } else {
      }
    } catch (err) {
    }

    const payload = {
      courseid: module.courseid,
      lessonid: module.id,
      weekid: week.id,
      userid: module.userid,
      orderno: nextOrderNo,
      status: 'active',
    };
    try {
      const res = await fetch('/api/weeklessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        throw new Error(`Failed to assign module to week: ${res.statusText}`);
      }
      
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('API error:', err);
      throw err;
    }
  };



  useEffect(() => {
    if (editModuleDialogOpen && editModuleDialogDescription) {
      // Remove HTML tags for textarea
      setEditModuleDialogDescription(editModuleDialogDescription.replace(/<[^>]+>/g, ''));
    }
  }, [editModuleDialogOpen]);













  // Add state for weekLessons (used for storing lessons for each week)
  const [weekLessons, setWeekLessons] = useState<{ [weekId: number]: any[] }>({});
  
  // Debug useEffect to log weekLessons changes
  useEffect(() => {
    console.log('weekLessons state changed:', weekLessons);
  }, [weekLessons]);

  // Helper function to fetch all data for selected course
  const fetchCourseData = async (courseId: string, skipWeekLessons = false) => {
    if (!courseId) {
      setModules([]);
      setWeeksFromApi([]);
      setWeekLessons({});
      return;
    }
    try {
      // 1. Fetch lessons (modules)
      const lessonsRes = await fetch(`/api/lessons?courseid=${encodeURIComponent(courseId)}`);
      const lessonsData = await lessonsRes.json();
      setModules(Array.isArray(lessonsData) ? lessonsData : []);

      // 2. Fetch weeks
      const weeksRes = await fetch(`/api/weeks?courseid=${encodeURIComponent(courseId)}`);
      const weeksData = await weeksRes.json();
      const weeksArr = Array.isArray(weeksData) ? weeksData : [];
      setWeeksFromApi(weeksArr);

      // 3. For each week, fetch its lessons (only if not skipped)
      if (!skipWeekLessons) {
        const weekLessonsObj: { [weekId: number]: any[] } = {};
        await Promise.all(
          weeksArr.map(async (week: any) => {
            const weekId = week.id || week.weekid;
            try {
              const wlRes = await fetch(`/api/weeklessons/week/${weekId}`);
              const wlData = await wlRes.json();
              weekLessonsObj[weekId] = Array.isArray(wlData) ? wlData : [];
            } catch {
              weekLessonsObj[weekId] = [];
            }
          })
        );
        setWeekLessons(weekLessonsObj);
      }
    } catch (err) {
      setModules([]);
      setWeeksFromApi([]);
      setWeekLessons({});
    }
  };

  // Fetch all data when selectedCourse changes
  useEffect(() => {
    if (selectedCourse) {
      fetchCourseData(selectedCourse);
    } else {
      setModules([]);
      setWeeksFromApi([]);
      setWeekLessons({});
    }

  }, [selectedCourse]);



  // Add this function inside LessonPlanPage component:
  const handleDeleteLessonFromWeek = async (weekId: number, weekLessonId: number) => {
    try {
      const res = await fetch(`/api/weeklessons/${weekLessonId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete lesson from week');
      toast.success('Lesson removed from week!');
      // Refresh weekLessons for this week
      const wlRes = await fetch(`/api/weeklessons/week/${weekId}`);
      const wlData = await wlRes.json();
      setWeekLessons(prev => ({ ...prev, [weekId]: Array.isArray(wlData) ? wlData : [] }));
    } catch (err) {
      toast.error('Could not remove lesson from week');
    }
  };

  // 1. Add state for delete dialog for week lesson
  const [deleteWeekLessonDialogOpen, setDeleteWeekLessonDialogOpen] = useState(false);
  const [deleteWeekLessonData, setDeleteWeekLessonData] = useState<{ weekId: number, weekLessonId: number } | null>(null);

  // Add state for AI query and reference for right side edit dialog
  const [rightSideAiQuery, setRightSideAiQuery] = useState("");
  const [rightSideAiReference, setRightSideAiReference] = useState("");

  // Add AI Generate handler for right side edit dialog
  const handleRightSideAIGenerate = async () => {
    // Permanently disable this button after first click
    
    setIsAIGenerating(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('User token is missing!');
        return;
      }
      const generation_type = rightSideEditForm.type || "quiz";
      const material = rightSideAiReference || "";
      const qaqf_level = String(rightSideEditForm.qaqfLevel || "1");
      const subject = rightSideEditForm.title || "";
      const userquery = rightSideAiQuery || "";
      const response = await fetch('/api/ai/assessment-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          generation_type,
          material,
          qaqf_level,
          subject,
          userquery,
        }),
      });
      if (!response.ok) throw new Error('Failed to generate content');
      const data = await response.json();
      if (data.generated_content && data.generated_content.length > 0) {
        setRightSideEditForm(f => ({ ...f, description: data.generated_content}));
      } else {
        setRightSideEditForm(f => ({ ...f, description: "No content generated." }));
      }
    } catch (error) {
      console.error('AI Generate error:', error);
      setRightSideEditForm(f => ({ ...f, description: "AI generation failed." }));
    } finally {
      setIsAIGenerating(false);
      // Button stays permanently disabled - no re-enabling
    }
  };

  // Add state for AI query and reference for Add Lesson dialog
  const [newModuleAiQuery, setNewModuleAiQuery] = useState("");
  const [newModuleAiReference, setNewModuleAiReference] = useState("");
  

  // Add AI Generate handler for Add Lesson dialog
  const handleAddModuleAIGenerate = async () => {
    // Permanently disable this button after first click
    
    setIsAIGenerating(true);
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('User token is missing!');
        return;
      }
  
      const generation_type = newModuleType || "quiz";
      const material = newModuleAiReference || "";
      const qaqf_level = String(newModuleQAQF || "1");
      const subject = newModuleTitle || "";
      const userquery = newModuleAiQuery || "";
  
      const response = await fetch('http://38.29.145.85:8000/api/ai/assessment-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          generation_type,
          material,
          qaqf_level,
          subject,
          userquery,
        }),
      });
  
      const data = await response.json();
  
      if (data.generated_content?.length > 0) {
        setNewModuleDescription(data.generated_content);
      } else {
        setNewModuleDescription("No content generated.");
      }
    } catch (error) {
      console.error("AI Generate error:", error);
      setNewModuleDescription("AI generation failed.");
    } finally {
      setIsAIGenerating(false);
      // Button stays permanently disabled - no re-enabling
    }
  };
  

  return (
    <div className="container max-w-screen-xl mx-auto py-6 px-4">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Weekly Lesson Planning</h3>
          <p className="text-neutral-600 mb-4">
            Create and manage weekly lesson plans for your course content. Organize your approved content into a structured schedule for up to 12 weeks.
          </p>
          <div className="border rounded-md p-4 bg-neutral-50 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-icons text-amber-500">info</span>
              <p className="text-sm font-medium">Only approved course content can be added to weekly lesson plans</p>
            </div>
            <p className="text-sm text-neutral-600">
              Select modules from your library and assign them to weeks using the add/edit features below. Drag-and-drop is disabled.
            </p>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Select Course to Plan</h4>
            <div className="flex items-center gap-2">
              <Select
                value={selectedCourse}
                onValueChange={(courseId) => setSelectedCourse(courseId)}
              >
                <SelectTrigger className="w-[250px]  focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.length === 0 ? (
                    <div className="px-3 py-2 text-neutral-400 text-sm">No courses yet</div>
                  ) : (
                    courses.map((course, idx) => (
                      <SelectItem key={idx} value={course.id}>{course.title}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddCourseDialogOpen(true)}
              >
                Add Course
              </Button>
            </div>
          </div>
          {/* Only show headings if no course is selected */}
          {!selectedCourse ? (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: Modules Heading Only */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-medium">Available Approved Content</h5>
                </div>
              </div>
              {/* Right: Weeks Heading Only */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-medium">Weekly Schedule</h5>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-md p-4 bg-white mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Modules (no drag) */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-medium">Available Approved Content</h5>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => setAddModuleDialogOpen(true)}
                      >
                        <span className="material-icons text-base">add</span>
                        Add
                      </Button>
                    </div>
                  </div>


                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {getUnassignedModules().map((content) => (
                      <div key={content.id} className="border rounded-md p-3 bg-neutral-50 hover:shadow-sm transition-all cursor-move" draggable onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                        e.dataTransfer.setData('moduleId', content.id);
                      }}>
                        <div className="flex justify-between mb-1 items-center">
                          <h6 className="font-medium flex items-center gap-1">
                            {content.title}
                            {/* Eye, Edit, Delete icons moved here */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-1"
                              onClick={e => {
                                e.stopPropagation();
                                setOpenModuleId(openModuleId === content.id ? null : content.id);
                              }}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-1"
                              onClick={e => {
                                e.stopPropagation();
                                handleEditRightSideModule(content);
                              }}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-1 text-red-600 hover:text-red-700"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteRightSideModule(content);
                              }}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </h6>
                          <span className="flex gap-1 items-center">
                            {(content.qaqfLevel || content.level || content.qaqf_level) && (
                              <span className={
                                (content.qaqfLevel || content.level || content.qaqf_level) <= 3 ? "bg-blue-100 text-blue-800 px-2 py-1 rounded" :
                                  (content.qaqfLevel || content.level || content.qaqf_level) <= 6 ? "bg-purple-100 text-purple-800 px-2 py-1 rounded" :
                                    "bg-violet-100 text-violet-800 px-2 py-1 rounded"
                              }>
                                QAQF {content.qaqfLevel || content.level || content.qaqf_level}: {QAQF_LEVELS[content.qaqfLevel || content.level || content.qaqf_level]}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs ">
                          <span>{content.type}</span>
                          <span>{content.duration}</span>
                        </div>
                        {/* Slide-down details */}
                        {openModuleId === content.id && (
                          <div className="mt-3 bg-neutral-50 border rounded shadow p-4 animate-slideDown relative">
                            <div className="flex flex-col items-start mb-2">
                              <div><b>Title:</b> {content.title}</div>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div><b>Type:</b> {content.type}</div>
                              <div><b>Duration:</b> {content.duration}</div>
                              <div>
                                <b>QAQF Level:</b>{" "}
                                {(() => {
                                  const qaqfLevel = content.qaqfLevel || content.level || content.qaqf_level;
                                  if (qaqfLevel && QAQF_LEVELS[qaqfLevel]) {
                                    return `QAQF ${qaqfLevel}: ${QAQF_LEVELS[qaqfLevel]}`;
                                  } else {
                                    return `N/A (level: ${content.level}, qaqfLevel: ${content.qaqfLevel}, qaqf_level: ${content.qaqf_level})`;
                                  }
                                })()}
                              </div>
                              <div><b>User ID:</b> {content.userid}</div>
                              <div><b>Course ID:</b> {content.courseid}</div>
                              <div>
                            <b>Description:</b>
                            <div 
                              className="mt-2 p-3 bg-white border rounded-md"
                              dangerouslySetInnerHTML={{ 
                                __html: content.description || (content.metadata && content.metadata.description) || "" 
                              }}
                            />
                          </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <style>{`
                      @keyframes slideDown {
                        from { opacity: 0; transform: translateY(-10px);}
                        to { opacity: 1; transform: translateY(0);}
                      }
                      .animate-slideDown {
                        animation: slideDown 0.2s ease;
                      }
                    `}</style>
                  </div>
                </div>
                {/* Right: Weeks (no drop) */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-medium">Weekly Schedule</h5>
                    <div className="flex gap-2">
                      <span className="text-sm text-neutral-500">
                        {selectedCourse ? `${weeksFromApi.length} weeks for this course` : 'No course selected'}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddDialogOpen(true)}
                        disabled={!selectedCourse}
                      >
                        <span className="material-icons text-sm mr-1">add</span>
                        Add Week
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {weeksToShow.map((week: any) => (
                      <div key={week.id} className="border rounded-md overflow-hidden bg-white">
                        <div className="bg-neutral-100 p-3 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <h6 className="font-medium text-sm">{week.title}</h6>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => {
                                setEditDialogOpen(true);
                                setEditDialogValue(week.title);
                                setEditWeekData({ ...week });
                              }}
                            >
                              <span className="material-icons text-sm">edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-red-600"
                              onClick={() => {
                                setDeleteWeekDialogOpen(true);
                                setDeleteWeekData({ ...week });
                              }}
                            >
                              <span className="material-icons text-sm">delete</span>
                            </Button>
                          </div>
                        </div>
                        <div
                          className="p-3 space-y-2 min-h-[60px]"
                          onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
                          onDrop={async (e) => {
                            e.preventDefault();
                            const moduleId = e.dataTransfer.getData('moduleId');
                            const module = modules.find(m => m.id.toString() === moduleId);
                            if (module) {
                              try {
                                
                                const result = await assignModuleToWeek(module, week);
                                if (result) {
                                
                                  setWeekLessons(prev => ({
                                    ...prev,
                                    [week.id]: [...(prev[week.id] || []), {
                                      id: result.id, 
                                      lessonid: module.id,
                                      title: module.title,
                                      weekid: week.id,
                                      orderno: result.orderno
                                    }]
                                  }));
                                  
                                  
                                  
                                  toast.success(`${module.title} added to ${week.title}`);
                                }
                              } catch (error) {
                                console.error('Error assigning module to week:', error);
                                toast.error("Failed to assign module to week");
                              }
                            }
                          }}
                        >
                          <h1>Drag and Drop Modules Here</h1>
                          {Array.isArray(weekLessons[week.id]) && weekLessons[week.id].length > 0 ? (
                            <DndContext
                              collisionDetection={closestCenter}
                              onDragEnd={async (event) => {
                                const { active, over } = event;
                                if (!active || !over || active.id === over.id) return;
                                
                                const oldIndex = weekLessons[week.id].findIndex((l: any) => l.id === active.id);
                                const newIndex = weekLessons[week.id].findIndex((l: any) => l.id === over.id);
                                if (oldIndex === -1 || newIndex === -1) return;
                          
                                const newLessons = arrayMove(weekLessons[week.id], oldIndex, newIndex);
                                setWeekLessons((prev) => ({ ...prev, [week.id]: newLessons }));
                                const orderPayload = newLessons.map((l: any, idx: number) => ({
                                  id: l.id, 
                                  orderno: idx + 1,
                                }));
                                
                                const validOrderPayload = orderPayload.filter(item => item.id !== undefined && item.orderno !== undefined);
                                await fetch('/api/weeklessonsorders', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(validOrderPayload), 
                                });
                                toast.success('Order updated!');
                              }}
                            >
                              <SortableContext
                                items={weekLessons[week.id].map((l: any) => l.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                <ul className="space-y-2">
                                  {weekLessons[week.id].map((lesson: any) => {
                                    const lessonId = lesson.lessonid || lesson.id;
                                    const weekLessonId = lesson.id;
                                    const found = modules.find(m => m.id === lessonId);
                                    return (
                                      <SortableLesson key={weekLessonId} lesson={lesson}>
                                        {({ attributes, listeners }) => (
                                          <div className="border rounded p-2 bg-blue-50 flex items-center justify-between">
                                            <span>{lesson.title || (found ? found.title : "No Title")}</span>
                                            <span>
                                              {/* Drag handle */}
                                              <span {...attributes} {...listeners} style={{ cursor: 'grab', marginRight: 8 }}>☰</span>
                                              {/* Delete button */}
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-600 hover:text-red-800"
                                                onClick={e => {
                                                  e.stopPropagation();
                                                  console.log('Deleting lesson', weekLessonId);
                                                  setDeleteWeekLessonDialogOpen(true);
                                                  setDeleteWeekLessonData({ weekId: week.id, weekLessonId });
                                                }}
                                                title="Delete from week"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </span>
                                          </div>
                                        )}
                                      </SortableLesson>
                                    );
                                  })}
                                </ul>
                              </SortableContext>
                            </DndContext>
                          ) : (
                            <div className="text-neutral-400 italic">No modules assigned to this week.</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Saved Lesson Plans</h4>
            {/* <Badge>{lessonPlans.length} plans</Badge> */}
          </div>
          {/* This section has been removed as per instructions */}
          {/* {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading lesson plans...</p>
            </div>
          ) : lessonPlans.length === 0 ? (
            <div className="border rounded-md p-8 bg-gray-50 text-center">
              <p className="text-gray-500 mb-2">No lesson plans found.</p>
              <p className="text-sm text-gray-400">
                Create lesson plans in the AI Content Studio Processing Center to see them here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessonPlans
                .filter(plan => selectedCourse === "" || plan.courseid === selectedCourse)
                .map((plan) => (
                  <div key={plan.id} className="border rounded-md p-4 bg-white hover:shadow-sm transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                      <div>
                        <h5 className="font-medium">{plan.title}</h5>
                        <div className="text-sm text-neutral-500">
                          {plan.courseid ?? ""} • QAQF Level {plan.qaqf_level} • Duration: {plan.duration} • {Array.isArray(plan.activities) ? plan.activities.length : 0} activities
                        </div>
                      </div>
                      <div className="text-sm text-neutral-500">
                        Last updated: {new Date(plan.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Learning Objectives:</p>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(plan.learningObjectives) && plan.learningObjectives.slice(0, 2).map((objective: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {objective.length > 30 ? `${objective.substring(0, 30)}...` : objective}
                          </Badge>
                        ))}
                        {Array.isArray(plan.learningObjectives) && plan.learningObjectives.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{plan.learningObjectives.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setDeleteTargetId(plan.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1 bg-red-500" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )} */}
        </div>
      </div>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Week Title</DialogTitle>
          </DialogHeader>
          <input
            className="border rounded px-2 py-1 w-full mt-2"
            value={editDialogValue}
            onChange={e => setEditDialogValue(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogSave}>Save</Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="fixed left-1/2 bottom-8 top-auto -translate-x-1/2 w-full max-w-md">
          <DialogHeader>
            <DialogTitle>Add Week</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
           
            <input
              className="border rounded px-2 py-1 w-full"
              value={addWeeksForm.title}
              onChange={e => setAddWeeksForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Week Title"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleAddWeekApi}>Add Week</Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={editModuleDialogOpen} onOpenChange={setEditModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
         
            <input
              className="border rounded px-2 py-1 w-full"
              value={newModuleCourseId}
              onChange={e => setNewModuleCourseId(e.target.value)}
              placeholder="Course ID"
              autoFocus
            />
          
            <select
              className="border rounded px-2 py-1 w-full"
              value={editModuleDialogType || "lecture"}
              onChange={e => setEditModuleDialogType(e.target.value)}
            >
              <option value="lecture">Lecture</option>
              <option value="practical">Practical</option>
              <option value="seminar">Seminar</option>
              <option value="activity">Activity</option>
              <option value="case_study">Case Study</option>
            </select>
           
            <input
              className="border rounded px-2 py-1 w-full"
              value={editModuleDialogTitle}
              onChange={e => setEditModuleDialogTitle(e.target.value)}
              placeholder="Title"
            />
            <div className="flex gap-2">
              <input
                className="border rounded px-2 py-1 flex-1"
                value={editModuleDialogDuration || ""}
                onChange={e => setEditModuleDialogDuration(e.target.value)}
                placeholder="Duration (e.g. 60 min)"
              />
              <select
                className="border rounded px-2 py-1 flex-1"
                value={editModuleDialogQAQF || 1}
                onChange={e => setEditModuleDialogQAQF(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => (
                  <option key={lvl} value={lvl}>QAQF {lvl}</option>
                ))}
              </select>
            </div>

            <textarea
              className="border rounded px-2 py-1 w-full"
              value={editModuleDialogScript}
              onChange={e => setEditModuleDialogScript(e.target.value)}
              placeholder="Desciption"
              rows={3}
            />
            <div className="overflow-auto" style={{ maxHeight: 250 }}>
              <JoditEditor
                value={editModuleDialogDescription}
                config={{ readonly: false, height: 250, width: '100%' }}
                tabIndex={1}
                onBlur={newContent => setEditModuleDialogDescription(newContent)}
                onChange={() => { }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleEditModuleDialogSave}>Save</Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addModuleDialogOpen} onOpenChange={setAddModuleDialogOpen}>
        <DialogContent className="max-w-full w-full h-full">
          <DialogHeader>
            <DialogTitle>Add Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-0">
            <select
              className="border rounded px-2 py-1 w-full"
              value={newModuleType}
              onChange={e => setNewModuleType(e.target.value)}
            >
              <option value="lecture">Lecture</option>
              <option value="practical">Practical</option>
              <option value="seminar">Seminar</option>
              <option value="activity">Activity</option>
              <option value="case_study">Case Study</option>
              <option value="quiz">Quiz</option>
              <option value="exam">Exam</option>
              <option value="assignment">Assignment</option>
              <option value="practical">Practical</option>
            </select>
            {/* title */}
            <input
              className="border rounded px-2 py-1 w-full"
              value={newModuleTitle}
              onChange={e => setNewModuleTitle(e.target.value)}
              placeholder="Title"
              autoFocus
            />
            <div className="flex gap-2">
              <input
                className="border rounded px-2 py-1 flex-1"
                value={newModuleDuration}
                onChange={e => setNewModuleDuration(e.target.value)}
                placeholder="Duration (e.g. 60 min)"
              />
              <select
                className="border rounded px-2 py-1 flex-1"
                value={newModuleQAQF}
                onChange={e => setNewModuleQAQF(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => (
                  <option key={lvl} value={lvl}>QAQF {lvl}</option>
                ))}
              </select>
            </div>
           
            <input
              className="border rounded px-2 py-1 w-full"
              placeholder="Ask your Query"
              value={newModuleAiQuery}
              onChange={e => setNewModuleAiQuery(e.target.value)}
            />
            <input
              className="border rounded px-2 py-1 w-full"
              placeholder="AI reference study material"
              value={newModuleAiReference}
              onChange={e => setNewModuleAiReference(e.target.value)}
            />
            
            <div className="overflow-auto" style={{ maxHeight: 400 }}>
              <JoditEditor
                ref={editor}
                value={newModuleDescription}
                config={{ readonly: false, height: 350, width: '100%' }}
                tabIndex={1}
                onBlur={newContent => setNewModuleDescription(newContent)}
                onChange={() => { }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="default" 
              onClick={handleAddModuleAIGenerate}
            >
              {isAIGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  loading...
                </>
              ) : (
                'AI Generate'
              )}
            </Button>
            <Button variant="outline" onClick={() => handleAddModule({
              title: newModuleTitle,
              type: newModuleType,
              qaqfLevel: newModuleQAQF,
              duration: newModuleDuration,
              description: newModuleDescription,
              userid: newModuleUserId,
              courseid: selectedCourse,
            })}>Add</Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

   
      <Dialog open={addCourseDialogOpen} onOpenChange={setAddCourseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input
              className="border rounded px-2 py-1 w-full"
              value={courseForm.title}
              onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Title"
              autoFocus
            />
       
            <input
              className="border rounded px-2 py-1 w-full"
              value={courseForm.description}
              onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Description"
            />
            <select
              className="border rounded px-2 py-1 w-full"
              value={courseForm.status}
              onChange={e => setCourseForm(f => ({ ...f, status: e.target.value }))}
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Not Active">Not Active</option>
            </select>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={async () => {
              try {
                const res = await fetch('/api/courses', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(courseForm),
                });
                if (!res.ok) throw new Error('Failed to add course');
                await fetchCoursesFromAPI();
                setSelectedCourse(courseForm.title);
                toast.success("Course added!");
                setAddCourseDialogOpen(false);
                setCourseForm({ title: "", userid: "", description: "", status: "" });
              } catch (err) {
                toast.error("Could not add course");
              }
            }}>Add</Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

   
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Week</DialogTitle>
          </DialogHeader>
          {!selectedCourse ? (
            <div className="py-4 text-center text-neutral-500">
              Please select a course first before adding a week.
            </div>
          ) : (
            <div className="space-y-3">
             
              <input
                className="border rounded px-2 py-1 w-full"
                value={addWeeksForm.title}
                onChange={e => setAddWeeksForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Title"
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleAddWeekApi}
              disabled={!selectedCourse}
            >
              Add
            </Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    
      <Dialog open={addWeeksDialogOpen} onOpenChange={setAddWeeksDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Weeks</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">

            <input
              className="border rounded px-2 py-1 w-full"
              value={addWeeksForm.title}
              onChange={e => setAddWeeksForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Title"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              distributeModulesToWeeks();
              setAddWeeksDialogOpen(false);
            }}>Add Weeks</Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson Plan</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this? ID: {deleteTargetId}
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteTargetId(null);
              }}
            >
              Yes
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteTargetId(null);
              }}
            >
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

     
      <Dialog open={deleteModuleDialogOpen} onOpenChange={setDeleteModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Module</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this? (ID: {deleteModuleTarget?.moduleId})
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleteModuleTarget) {
                  const success = await handleDeleteModuleApi(deleteModuleTarget.moduleId);
                  if (success) {
                    // Refresh modules from API instead of manually updating state
                    await fetchModulesFromAPI(selectedCourse);
                  }
                  setDeleteModuleDialogOpen(false);
                  setDeleteModuleTarget(null);
                }
              }}
            >
              Yes
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModuleDialogOpen(false);
                setDeleteModuleTarget(null);
              }}
            >
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rightSideEditDialogOpen} onOpenChange={setRightSideEditDialogOpen}>
      <DialogContent className="max-w-full w-full h-full">
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input
              className="border rounded px-2 py-1 w-full"
              value={rightSideEditForm.title}
              onChange={e => setRightSideEditForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Title"
              autoFocus
            />
            <select
              className="border rounded px-2 py-1 w-full"
              value={rightSideEditForm.type}
              onChange={e => setRightSideEditForm(f => ({ ...f, type: e.target.value }))}
            >
              <option value="lecture">Lecture</option>
              <option value="practical">Practical</option>
              <option value="seminar">Seminar</option>
              <option value="activity">Activity</option>
              <option value="case_study">Case Study</option>
              <option value="quiz">Quiz</option>
              <option value="exam">Exam</option>
              <option value="assignment">Assignment</option>
              <option value="practical">Practical</option>
            </select>
            <div className="flex gap-2">
              <input
                className="border rounded px-2 py-1 flex-1"
                value={rightSideEditForm.duration}
                onChange={e => setRightSideEditForm(f => ({ ...f, duration: e.target.value }))}
                placeholder="Duration (e.g. 60 min)"
              />
              <select
                className="border rounded px-2 py-1 flex-1"
                value={rightSideEditForm.qaqfLevel}
                onChange={e => setRightSideEditForm(f => ({ ...f, qaqfLevel: Number(e.target.value) }))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => (
                  <option key={lvl} value={lvl}>QAQF {lvl}</option>
                ))}
              </select>
            </div>

            <input
              className="border rounded px-2 py-1 w-full"
              placeholder="Ask your query"
              value={rightSideAiQuery}
              onChange={e => setRightSideAiQuery(e.target.value)}
            />
            <input
              className="border rounded px-2 py-1 w-full"
              placeholder="AI reference study material"
              value={rightSideAiReference}
              onChange={e => setRightSideAiReference(e.target.value)}
            />
            <div className="overflow-auto" style={{ maxHeight: 400 }}>
              <JoditEditor
                value={rightSideEditForm.description}
                config={{ readonly: false, height: 400, width: '100%' }}
                tabIndex={1}
                onBlur={newContent => setRightSideEditForm(f => ({ ...f, description: newContent }))}
                onChange={() => { }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleSaveRightSideModuleEdit}>Save</Button>
            <Button 
              variant="default" 
              onClick={handleRightSideAIGenerate}
            >
              {isAIGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  loading...
                </>
              ) : (
                'AI Generate'
              )}
            </Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

  
      <Dialog open={rightSideDeleteDialogOpen} onOpenChange={setRightSideDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Module</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete "{rightSideDeleteModule?.title}"?
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={handleDeleteRightSideModuleConfirm}
            >
              Yes, Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setRightSideDeleteDialogOpen(false);
                setRightSideDeleteModule(null);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <Dialog open={editWeekDialogOpen} onOpenChange={setEditWeekDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Week</DialogTitle>
          </DialogHeader>
          {editWeekData && (
            <div className="space-y-3">
              <input
                className="border rounded px-2 py-1 w-full"
                value={editWeekData.courseid || ''}
                onChange={e => setEditWeekData((prev: any) => ({ ...prev, courseid: e.target.value }))}
                placeholder="Course ID"
              />
              <input
                className="border rounded px-2 py-1 w-full"
                value={editWeekData.title || ''}
                onChange={e => setEditWeekData((prev: any) => ({ ...prev, title: e.target.value }))}
                placeholder="Title"
              />

            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleEditWeekSave}>Save</Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteWeekDialogOpen} onOpenChange={setDeleteWeekDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Week</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this week? ID: {deleteWeekData?.id}
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleteWeekData?.id) {
                  try {
                    await deleteWeekById(deleteWeekData.id);
                    toast.success("Week deleted successfully!");
                    setDeleteWeekDialogOpen(false);
                    setDeleteWeekData(null);
                  } catch (err) {
                    toast.error("Failed to delete week. Please try again.");
                  }
                }
              }}
            >
              Yes
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteWeekDialogOpen(false);
                setDeleteWeekData(null);
              }}
            >
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

     
      <Dialog open={deleteWeekLessonDialogOpen} onOpenChange={setDeleteWeekLessonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson from Week</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this? ID: {deleteWeekLessonData?.weekLessonId}
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleteWeekLessonData) {
                  await handleDeleteLessonFromWeek(deleteWeekLessonData.weekId, deleteWeekLessonData.weekLessonId);
                  setDeleteWeekLessonDialogOpen(false);
                  setDeleteWeekLessonData(null);
                }
              }}
            >
              Yes
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteWeekLessonDialogOpen(false);
                setDeleteWeekLessonData(null);
              }}
            >
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};





export default LessonPlanPage;











function SortableLesson({
  lesson,
  children,
}: {
  lesson: any;
  children: (args: { attributes: any; listeners: any }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        background: '#e9f1ff',
        marginBottom: 8,
      }}
    >
      {children({ attributes, listeners })}
    </li>
  );
}