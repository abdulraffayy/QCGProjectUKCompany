// import drag drop function 

import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { LessonPlan } from '../../shared/schema';
import { Clock, Users, Edit, Download, Eye, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "../components/ui/dialog";
// import { Editor } from '@tinymce/tinymce-react';
import JoditEditor from 'jodit-react';
import { Skeleton } from '../components/ui/skeleton';

type LessonPlanWithCourse = LessonPlan & {
  courseid?: string;
  learningObjectives?: string[];
};

const DRAGGABLE_PREFIX = 'module-';
const DROPPABLE_PREFIX = 'week-';

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

// --- Types for Course/Week/Lesson Viewer Section ---
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
  const [description, setDescription] = useState('');
  const config = {
    readonly: false,
    height: 250,
    width: '100%',
  };

  // Utility function to strip HTML tags from text
  const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  };



  // Define a type for Week
  interface Week {
    id: number;
    title: string;
    modules: any[];
    isEditing: boolean;
  }



  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const { toast } = useToast();
  const [modules, setModules] = useState<any[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [draggedModule, setDraggedModule] = useState<any>(null);
  const [editingWeekId, setEditingWeekId] = useState<number | null>(null);
  const [editingModule, setEditingModule] = useState<{ weekId: number, moduleId: number } | null>(null);
  const [moduleEditValue, setModuleEditValue] = useState<string>("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDialogValue, setEditDialogValue] = useState("");
  const [editDialogWeekId, setEditDialogWeekId] = useState<number | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogValue, setAddDialogValue] = useState("");
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
  const [editModuleDialogLevel, setEditModuleDialogLevel] = useState("");
  const [editModuleDialogDescription, setEditModuleDialogDescription] = useState("");
  const [dummyCourse, setDummyCourse] = useState<any>("")
  const [refreshWeeks, setRefreshWeeks] = useState<number>(0);
  const [refreshModules, setRefreshModules] = useState<number>(0);

  // For intra-week drag and drop - REMOVED since we only allow left-to-right dragging

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

  // Add Lesson Dialog state
  const [lessonForm, setLessonForm] = useState({
    courseid: "",
    title: "",
    level: "",
    description: "",
    userid: "",
    duration: "",
    type: "lecture",
  });

  // Add Weeks Dialog state
  const [addWeeksDialogOpen, setAddWeeksDialogOpen] = useState(false);
  const [addWeeksForm, setAddWeeksForm] = useState({ courseid: '', title: '' });

  // Fetch saved lesson plans from the database
  // const { data: lessonPlans = [], isLoading, refetch } = useQuery<LessonPlanWithCourse[]>({
  //   queryKey: ['/api/lesson-plans'],
  // });

  const [courses, setCourses] = useState<{ id: string, title: string }[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);




  // Add state for module delete dialog
  const [deleteModuleDialogOpen, setDeleteModuleDialogOpen] = useState(false);
  const [deleteModuleTarget, setDeleteModuleTarget] = useState<{ weekId: number, moduleId: number } | null>(null);

  // Add state for right side module edit dialog
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
    description: "", // <-- YEH LINE ZARUR ADD KAREN
  });

  // Add state for right side module delete dialog
  const [rightSideDeleteDialogOpen, setRightSideDeleteDialogOpen] = useState(false);
  const [rightSideDeleteModule, setRightSideDeleteModule] = useState<any>(null);

  // Function to fetch courses from API
  const fetchCoursesFromAPI = async (userid?: string) => {
    try {
      let url = '/api/courses';
      if (userid) {
        url += `?userid=${encodeURIComponent(userid)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setDummyCourse(data)

      // Assuming API returns array of course objects with a 'title' property
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      // Optionally show a toast or ignore
    }
  };

  // Function to fetch modules from the API (now accepts courseId)
  const fetchModulesFromAPI = async (courseId?: string) => {
    try {
      let url = '/api/lessons';
      if (courseId) {
        url += `?courseid=${encodeURIComponent(courseId)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch lessons');
      const data = await res.json();
      setModules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching modules:', err);
      // Optionally show a toast or ignore
    }
  };

  // Function to add a week via API (move to top for clarity)
  const handleAddWeekApi = async () => {
    try {
      if (!selectedCourse) {
        toast({ title: "Error", description: "Please select a course first", variant: "destructive" });
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

      // Get the created week from response
      const newWeek = await res.json();

      toast({ title: "Success", description: "Week added!" });

      // Close the dialog and reset form
      setAddDialogOpen(false);
      setAddWeeksForm({ courseid: "", title: "" });

      // Add a small delay to ensure the API has processed the new week
      await new Promise(resolve => setTimeout(resolve, 500));

      // Now fetch weeks for the selected course and update state
      await fetchWeeksFromAPI(selectedCourse);

      // Force a re-render by updating the refreshWeeks state
      setRefreshWeeks(prev => prev + 1);
    } catch (err) {
      console.error('Error adding week:', err);
      toast({ title: "Error", description: "Could not add week", variant: "destructive" });
    }
  };

  // Function to add a lesson via API
  const handleAddLessonApi = async () => {
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lessonForm, courseid: selectedCourse }),
      });
      if (!res.ok) throw new Error('Failed to add lesson');
      toast({ title: "Success", description: "Lesson added!" });
      setAddDialogOpen(false);
      setLessonForm({
        courseid: "",
        title: "",
        level: "",
        description: "",
        userid: "",
        duration: "",
        type: "lecture",
      });
    } catch (err) {
      toast({ title: "Error", description: "Could not add lesson", variant: "destructive" });
    }
  };

  // Function to add multiple weeks via API
  const handleAddWeeks = async () => {
    try {
      const res = await fetch('/api/weeks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addWeeksForm),
      });
      if (!res.ok) throw new Error('Failed to add week');
      setWeeks(weeks => {
        const currentWeeks = weeks || [];
        const firstEmptyIdx = currentWeeks.findIndex(w => w.modules.length === 0);
        if (firstEmptyIdx !== -1) {
          // Only add the module, do NOT change the week title
          const newWeeks = [...currentWeeks];
          newWeeks[firstEmptyIdx] = {
            ...newWeeks[firstEmptyIdx],
            modules: [{
              id: Date.now(),
              title: addWeeksForm.title,
              type: 'lecture',
              qaqfLevel: 1,
              duration: '',
              script: '',
              courseid: addWeeksForm.courseid,
            }],
          };
          return newWeeks;
        } else {
          // If all weeks are filled, add a new week at the end
          return [
            ...currentWeeks,
            {
              id: currentWeeks.length > 0 ? Math.max(...currentWeeks.map(w => w.id)) + 1 : 1,
              title: `Week ${currentWeeks.length + 1}`,
              modules: [{
                id: Date.now(),
                title: addWeeksForm.title,
                type: 'lecture',
                qaqfLevel: 1,
                duration: '',
                script: '',
                courseid: addWeeksForm.courseid,
              }],
              isEditing: false,
            },
          ];
        }
      });
      setAddWeeksDialogOpen(false);
      setAddWeeksForm({ courseid: '', title: '' });
      toast({ title: 'Success', description: 'Week added!' });
    } catch (err) {
      toast({ title: 'Error', description: 'Could not add week', variant: 'destructive' });
    }
  };

  // Fetch courses on mount and when user changes
  useEffect(() => {
    if (selectedUser) {
      fetchCoursesFromAPI(selectedUser);
      // Clear selected course when user changes
      setSelectedCourse("");
    } else {
      // Fetch all courses if no user selected
      fetchCoursesFromAPI();
    }
  }, [selectedUser]);

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

  // Drag and drop handlers
  const handleDragStart = (module: any) => {
    setDraggedModule(module);
  };
  const handleDrop = (weekId: number) => {
    if (draggedModule) {
      setWeeks(weeks => {
        const currentWeeks = weeks || [];
        return currentWeeks.map(week =>
          week.id === weekId
            ? { ...week, modules: [...week.modules, { ...draggedModule }] }
            : week
        );
      });
      setModules(modules => modules.filter(m => m.id !== draggedModule.id));
      setDraggedModule(null);
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Week title edit (popup)
  const handleEditWeekTitle = (weekId: number, currentTitle: string) => {
    setEditDialogWeekId(weekId);
    setEditDialogValue(currentTitle);
    setEditDialogOpen(true);
  };
  const handleDialogSave = () => {
    if (editDialogWeekId !== null) {
      setWeeks(weeks => {
        const currentWeeks = weeks || [];
        return currentWeeks.map(week =>
          week.id === editDialogWeekId ? { ...week, title: editDialogValue } : week
        );
      });
    }
    setEditDialogOpen(false);
    setEditDialogWeekId(null);
    setEditDialogValue("");
  };
  const handleSaveWeekTitle = () => {
    setEditingWeekId(null);
  };
  const handleDeleteWeek = (weekId: number) => {
    setWeeks(weeks => {
      const currentWeeks = weeks || [];
      return currentWeeks.filter(week => week.id !== weekId);
    });
  };

  // Add week handlers
  const handleAddWeek = () => {
    setAddDialogValue("");
    setAddDialogOpen(true);
  };
  const handleAddDialogSave = () => {
    if (addDialogValue.trim() !== "") {
      setWeeks(weeks => {
        const currentWeeks = weeks || [];
        return [
          ...currentWeeks,
          {
            id: currentWeeks.length > 0 ? Math.max(...currentWeeks.map(w => w.id)) + 1 : 1,
            title: addDialogValue,
            modules: [],
            isEditing: false,
          },
        ];
      });
    }
    setAddDialogOpen(false);
    setAddDialogValue("");
  };

  // Module edit
  const handleEditModule = (weekId: number, moduleId: number, script: string) => {
    setEditingModule({ weekId, moduleId });
    setModuleEditValue(script);
  };
  const handleModuleScriptChange = (value: string) => {
    setModuleEditValue(value);
  };
  const handleSaveModule = () => {
    if (editingModule) {
      setWeeks(weeks => {
        const currentWeeks = weeks || [];
        return currentWeeks.map(week => {
          if (week.id === editingModule.weekId) {
            return {
              ...week,
              modules: week.modules.map((mod: any) =>
                mod.id === editingModule.moduleId ? { ...mod, script: moduleEditValue } : mod
              )
            };
          }
          return week;
        });
      });
      setEditingModule(null);
      setModuleEditValue("");
    }
  };


  // Module edit dialog handlers
  const handleOpenEditModuleDialog = (weekId: number, module: any) => {
    setEditModuleDialogWeekId(weekId);
    setEditModuleDialogModuleId(module.id);
    setEditModuleDialogTitle(module.title);
    setEditModuleDialogScript(module.script || "");
    setEditModuleDialogCourseId(module.courseid || "");
    setEditModuleDialogUserId(module.userid || "");
    setEditModuleDialogType(module.type || "lecture");
    setEditModuleDialogDuration(module.duration || "");
    setEditModuleDialogQAQF(module.qaqfLevel || 1);
    setEditModuleDialogLevel(module.level || "");
    setEditModuleDialogDescription(module.description || ""); // Use the actual description as-is
    setEditModuleDialogOpen(true);
  };
  const handleEditModuleDialogSave = async () => {
    if (editModuleDialogWeekId !== null && editModuleDialogModuleId !== null) {
      // Update local weeks state immediately for better UX
      setWeeks(weeks => {
        const currentWeeks = weeks || [];
        return currentWeeks.map(week => {
          if (week.id === editModuleDialogWeekId) {
            return {
              ...week,
              modules: week.modules.map((mod: any) =>
                mod.id === editModuleDialogModuleId
                  ? {
                    ...mod,
                    title: editModuleDialogTitle,
                    description: stripHtml(editModuleDialogDescription), // Strip HTML tags
                    courseid: editModuleDialogCourseId,
                    userid: editModuleDialogUserId,
                    type: editModuleDialogType,
                    duration: editModuleDialogDuration,
                    qaqfLevel: editModuleDialogQAQF,
                    level: editModuleDialogLevel,
                  }
                  : mod
              )
            };
          }
          return week;
        });
      });
      
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
    setEditModuleDialogLevel("");
  };

  // Intra-week drag handlers - REMOVED since we only allow left-to-right dragging

  const handleAddModule = async (newModule: any) => {
    // Prepare the module data with courseid and stripped description
    const moduleWithCourseId = {
      ...newModule,
      description: stripHtml(newModule.description), // Strip HTML tags
      courseid: selectedCourse,
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
      toast({ title: 'Success', description: 'Module added!' });
    } catch (err) {
      toast({ title: 'Error', description: 'Could not add module', variant: 'destructive' });
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
      qaqfLevel: editModuleDialogQAQF,
      level: editModuleDialogLevel,
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
        
        // Also update assignedModules state with server data
        setAssignedModules(prev => {
          const newAssigned = { ...prev };
          Object.keys(newAssigned).forEach(weekIdStr => {
            const weekId = parseInt(weekIdStr);
            if (newAssigned[weekId]) {
              newAssigned[weekId] = newAssigned[weekId].map((mod: any) =>
                mod.id === id
                  ? { ...mod, ...serverUpdatedModule }
                  : mod
              );
            }
          });
          return newAssigned;
        });
      } else {
        // Fallback: update with payload if server fetch fails
        setModules(prevModules => 
          prevModules.map(module => 
            module.id === id 
              ? { ...module, ...updatedModule }
              : module
          )
        );
        
        setAssignedModules(prev => {
          const newAssigned = { ...prev };
          Object.keys(newAssigned).forEach(weekIdStr => {
            const weekId = parseInt(weekIdStr);
            if (newAssigned[weekId]) {
              newAssigned[weekId] = newAssigned[weekId].map((mod: any) =>
                mod.id === id
                  ? { ...mod, ...updatedModule }
                  : mod
              );
            }
          });
          return newAssigned;
        });
      }
      
      // Force a re-render to ensure UI updates
      setRefreshModules(prev => prev + 1);
      
      toast({ title: "Success", description: "Module updated!" });
    } catch (err) {
      toast({ title: "Error", description: "Could not update module", variant: "destructive" });
    }
  };

  // Add function to delete module from backend
  const handleDeleteModuleApi = async (id: number) => {
    try {
      const res = await fetch(`/api/lessons/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete module');
      toast({ title: 'Success', description: 'Module deleted!' });
      return true;
    } catch (err) {
      toast({ title: 'Error', description: 'Could not delete module', variant: 'destructive' });
      return false;
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user.userid;


  const CourseIDD = Array.isArray(dummyCourse)
    ? dummyCourse.find((item) => item?.id === selectedCourse)?.id
    : undefined;


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
    if (addDialogOpen && userId) {
      setLessonForm(f => ({ ...f, userid: userId }));
    }
  }, [addDialogOpen, userId]);

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

    setWeeks(weeksCopy);
    // Optionally clear modules list if you want
    // setModules([]);
    // Optionally persist to localStorage
    localStorage.setItem("weeks", JSON.stringify(weeksCopy));
  };

  const [weeksFromApi, setWeeksFromApi] = useState<any[]>([]);

  const fetchWeeksFromAPI = async (courseId: string) => {
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
      fetchWeeksFromAPI(selectedCourse);
    } else {
      setWeeksFromApi([]); // Clear weeks when no course is selected
    }
    // Clear assigned modules when course changes
    setAssignedModules({});
  }, [selectedCourse]);

  const [draggedContent, setDraggedContent] = useState<any | null>(null);

  const handleDropOnWeek = (week: any) => {
    if (!draggedContent) return;
    // Here you would POST to your backend to assign the lesson to the week
    // Example:
    fetch('/api/weeklessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseid: week.courseid,
        lessonid: draggedContent.id,
        weekid: week.id,
        userid: draggedContent.userid, // or current user id
        orderno: Math.floor(Math.random() * 100000) + 1, // random orderno
        status: 'active'
      })
    })
      .then(res => res.json())
      .then(data => {
        // Optionally, show a toast or refresh week lessons
        setDraggedContent(null);
        // Optionally, refetch weeks or weeklessons here
      });
  };


  function DraggableLesson({ lesson }: { lesson: any }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: lesson.id,
      data: lesson, // extra info if needed
    });

    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="border rounded-md p-3 bg-neutral-50 hover:shadow-sm cursor-move transition-all"
        style={{
          transform: transform
            ? `translate(${transform.x}px, ${transform.y}px)`
            : undefined,
        }}
      >
        <h6 className="font-medium">{lesson.title}</h6>
        <div className="text-xs text-neutral-500">{lesson.type} • {lesson.duration}</div>
      </div>
    );
  }



  function DroppableWeek({ week, children }: { week: any, children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({
      id: DROPPABLE_PREFIX + week.id,
    });
    return (
      <div
        ref={setNodeRef}
        className={`border rounded-md overflow-hidden ${isOver ? 'bg-green-100' : ''}`}
      >
        {children}
      </div>
    );
  }


  // DnDKit: onDragStart handler for DragOverlay
  const onDragStart = (event: DragStartEvent) => {
    const moduleId = parseInt(event.active.id.toString().replace(DRAGGABLE_PREFIX, ''));
    const module = modules.find((m) => m.id === moduleId);
    if (module) setActiveDragModule(module);
  };

  // DnDKit: onDragEnd handler - Modified to only allow left to right dragging
  const onDragEnd = async (event: DragEndEvent) => {
    setActiveDragModule(null);
    const { active, over } = event;
    if (!active || !over) return;

    // Only handle if dragging from left to right (modules to weeks)
    if (
      active.id.toString().startsWith(DRAGGABLE_PREFIX) &&
      over.id.toString().startsWith(DROPPABLE_PREFIX)
    ) {
      // Don't handle drag and drop here - let the onDrop handler handle it
      // This prevents duplicate API calls and order number issues
    }
  };


  // Add a state to track which modules are assigned to which week
  const [assignedModules, setAssignedModules] = useState<{ [weekId: number]: any[] }>({});

  // Helper: Get unassigned modules (not in any week, only for selected course)
  const getUnassignedModules = () => {
    const assignedIds = Object.values(assignedModules).flat().map((m) => m.id);
    return modules.filter(
      (m) => !assignedIds.includes(m.id) && m.courseid === selectedCourse
    );
  };

  // Helper: Get modules for a week (only for selected course)
  const getModulesForWeek = (weekId: number) => {
    const modules = assignedModules[weekId] || [];
    // Only return modules that belong to the selected course
    const filteredModules = modules.filter(module => module.courseid === selectedCourse);
    return filteredModules;
  };

  // Function to call API when module is dropped on week (DEPRECATED - use assignModuleToWeek instead)
  const handleModuleDropOnWeek = async (week: any, module: any) => {
    // This function is deprecated - use assignModuleToWeek instead
  };

  // Add this function near the other API helpers
  const fetchWeekLessons = async (weekId: number) => {
    try {
      const res = await fetch(`/api/weeklessons`);
      if (!res.ok) throw new Error('Failed to fetch week lessons');
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Error fetching week lessons:', err);
      return null;
    }
  };

  // Add function to handle Add Weeks button click
  const handleAddWeeksClick = async () => {
    try {
      if (!selectedCourse) {
        toast({ title: "Error", description: "Please select a course first", variant: "destructive" });
        return;
      }

      const res = await fetch('/api/weeks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseid: selectedCourse,
          title: `Week ${weeksFromApi.length + 1}`,
          userid: userId
        }),
      });
      if (!res.ok) throw new Error('Failed to add week');
      toast({ title: "Success", description: "Week added!" });
      await fetchWeeksFromAPI(selectedCourse);
    } catch (err) {
      toast({ title: "Error", description: "Could not add week", variant: "destructive" });
    }
  };

  // Function to handle edit module on right side
  const handleEditRightSideModule = (module: any) => {
    setRightSideEditModule(module);
    setRightSideEditForm({
      title: module.title || "",
      type: module.type || "lecture",
      duration: module.duration || "",
      qaqfLevel: module.qaqfLevel || 1,
      script: module.script || "",
      courseid: module.courseid || "",
      userid: module.userid || "",
      level: module.level || "",
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
        description: stripHtml(rightSideEditForm.description), // Strip HTML tags
        level: rightSideEditForm.level,             // include level
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
        
        // Update the module in assignedModules state with server data
        setAssignedModules(prev => {
          const newAssigned = { ...prev };
          Object.keys(newAssigned).forEach(weekIdStr => {
            const weekId = parseInt(weekIdStr);
            if (newAssigned[weekId]) {
              newAssigned[weekId] = newAssigned[weekId].map((mod: any) =>
                mod.id === rightSideEditModule.id
                  ? { ...mod, ...updatedModule }
                  : mod
              );
            }
          });
          return newAssigned;
        });

        // Also update the main modules state with server data
        setModules(prevModules => 
          prevModules.map(module => 
            module.id === rightSideEditModule.id 
              ? { ...module, ...updatedModule }
              : module
          )
        );
      } else {
        // Fallback: update with payload if server fetch fails
        setAssignedModules(prev => {
          const newAssigned = { ...prev };
          Object.keys(newAssigned).forEach(weekIdStr => {
            const weekId = parseInt(weekIdStr);
            if (newAssigned[weekId]) {
              newAssigned[weekId] = newAssigned[weekId].map((mod: any) =>
                mod.id === rightSideEditModule.id
                  ? { ...mod, ...payload }
                  : mod
              );
            }
          });
          return newAssigned;
        });

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
      
      toast({ title: "Success", description: "Module updated!" });
      setRightSideEditDialogOpen(false);
      setRightSideEditModule(null);
    } catch (err) {
      toast({ title: "Error", description: "Could not update module", variant: "destructive" });
    }
  };

  // Function to delete right side module
  const handleDeleteRightSideModuleConfirm = async () => {
    if (!rightSideDeleteModule) return;

    try {
      const success = await handleDeleteModuleApi(rightSideDeleteModule.id);
      if (success) {
        // Remove from assignedModules
        setAssignedModules(prev => {
          const newAssigned = { ...prev };
          Object.keys(newAssigned).forEach(weekIdStr => {
            const weekId = parseInt(weekIdStr);
            if (newAssigned[weekId]) {
              newAssigned[weekId] = newAssigned[weekId].filter((mod: any) => mod.id !== rightSideDeleteModule.id);
            }
          });
          return newAssigned;
        });

        // Also remove from the modules list (left side) if it exists there
        setModules(prevModules =>
          prevModules.filter(module => module.id !== rightSideDeleteModule.id)
        );

        toast({ title: "Success", description: "Module deleted!" });
        setRightSideDeleteDialogOpen(false);
        setRightSideDeleteModule(null);
      }
    } catch (err) {
      toast({ title: "Error", description: "Could not delete module", variant: "destructive" });
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

      toast({ title: "Success", description: "Week updated!" });
      setEditWeekDialogOpen(false);
      setEditWeekData(null);
      await fetchWeeksFromAPI(selectedCourse); // Refresh weeks from API for selected course
      setRefreshWeeks(prev => prev + 1); // Force re-render
    } catch (err) {
      toast({ title: "Error", description: "Could not update week", variant: "destructive" });
    }
  };

  const deleteWeekById = async (id: number) => {
    try {
      const res = await fetch(`/api/weeks/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete week');
      toast({ title: 'Success', description: 'Week deleted!' });
      await fetchWeeksFromAPI(selectedCourse); // Refresh weeks for selected course
      setRefreshWeeks(prev => prev + 1); // Force re-render
    } catch (err) {
      toast({ title: 'Error', description: 'Could not delete week', variant: 'destructive' });
    }
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
  const [viewModuleDialogOpen, setViewModuleDialogOpen] = useState(false);
  const [viewModuleData, setViewModuleData] = useState<any>(null);
  const [selectedModuleForView, setSelectedModuleForView] = useState<any>(null);

  // Add state for active drag module (for DnDKit)
  const [activeDragModule, setActiveDragModule] = useState<any>(null);

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

  // Add state to track order numbers for each week
  const [weekOrderCounters, setWeekOrderCounters] = useState<{ [weekId: number]: number }>({});

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
      const data = await res.json();

      // Don't refetch immediately to avoid resetting the UI state
      // The UI is already updated, so we just need to save to backend
      return data;
    } catch (err) {
      console.error('API error:', err);
      throw err;
    }
  };

  // 1. Add sensors for DnD Kit at the top of the component
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (editModuleDialogOpen && editModuleDialogDescription) {
      // Remove HTML tags for textarea
      setEditModuleDialogDescription(editModuleDialogDescription.replace(/<[^>]+>/g, ''));
    }
  }, [editModuleDialogOpen]);

  const fetchWeekModules = async (weekId: number) => {
    const res = await fetch(`/api/weeklessons/week/${weekId}`);
    const data = await res.json();
    setWeekModules(prev => ({
      ...prev,
      [weekId]: data.map((item: any) => item.module)
    })); ``
  };

  // Add state for weekModules (used in fetchWeekModules and DnD logic)
  const [weekModules, setWeekModules] = useState<{ [weekId: number]: any[] }>({});

  // 1. Assigned module IDs
  const assignedModuleIds = Object.values(weekModules)
    .flat()
    .filter(m => m && m.id !== undefined)
    .map(m => m.id);

  // 2. Unassigned modules
  const unassignedModules = modules.filter(
    m => !assignedModuleIds.includes(m.id)
  );

  // 3. Render left side
  {unassignedModules.map(module => (
    <div key={module.id}>{module.title}</div>
  ))}

  // At the top of your component
  const [filterStatus, setFilterStatus] = useState(() => localStorage.getItem('lessonFilterStatus') || 'all');

  // When filter changes
  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    localStorage.setItem('lessonFilterStatus', status);
  };

  // When fetching lessons, filter them:
  const filteredLessons = weeksToShow.filter(week =>
    filterStatus === 'all' ? true : week.status === filterStatus
  );

  // Add state for weekLessons (used for storing lessons for each week)
  const [weekLessons, setWeekLessons] = useState<{ [weekId: number]: any[] }>({});

  // Helper function to fetch all data for selected course
  const fetchCourseData = async (courseId: string) => {
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

      // 3. For each week, fetch its lessons
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
    setAssignedModules({});
  }, [selectedCourse]);

  // --- NEW: Course/Week/Lesson Viewer Section ---
  const [viewerCourses, setViewerCourses] = useState<SimpleCourse[]>([]);
  const [viewerLoadingCourses, setViewerLoadingCourses] = useState(false);
  const [viewerErrorCourses, setViewerErrorCourses] = useState<string | null>(null);
  const [viewerSelectedCourseId, setViewerSelectedCourseId] = useState<string>('');
  const [viewerWeeks, setViewerWeeks] = useState<SimpleWeek[]>([]);
  const [viewerLoadingWeeks, setViewerLoadingWeeks] = useState(false);
  const [viewerErrorWeeks, setViewerErrorWeeks] = useState<string | null>(null);
  const [viewerWeekLessons, setViewerWeekLessons] = useState<{ [weekId: number]: SimpleLesson[] }>({});
  const [viewerLoadingLessons, setViewerLoadingLessons] = useState<{ [weekId: number]: boolean }>({});
  const [viewerErrorLessons, setViewerErrorLessons] = useState<{ [weekId: number]: string | null }>({});

  // Fetch courses on mount
  useEffect(() => {
    setViewerLoadingCourses(true);
    setViewerErrorCourses(null);
    fetch('/api/courses')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch courses');
        return res.json();
      })
      .then(data => {
        // Accept both id or courseid
        setViewerCourses(
          (Array.isArray(data) ? data : []).map((c: any) => ({
            id: c.id || c.courseid,
            title: c.title,
          }))
        );
        setViewerLoadingCourses(false);
      })
      .catch(err => {
        setViewerErrorCourses('Error fetching courses');
        setViewerLoadingCourses(false);
      });
  }, []);

  // Fetch weeks when course changes
  useEffect(() => {
    if (!viewerSelectedCourseId) {
      setViewerWeeks([]);
      return;
    }
    setViewerLoadingWeeks(true);
    setViewerErrorWeeks(null);
    fetch(`/api/weeks?courseid=${encodeURIComponent(viewerSelectedCourseId)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch weeks');
        return res.json();
      })
      .then(data => {
        setViewerWeeks(
          (Array.isArray(data) ? data : []).map((w: any) => ({
            id: w.id || w.weekid,
            title: w.title,
          }))
        );
        setViewerLoadingWeeks(false);
      })
      .catch(err => {
        setViewerErrorWeeks('Error fetching weeks');
        setViewerLoadingWeeks(false);
      });
  }, [viewerSelectedCourseId]);

  // Fetch lessons for each week when weeks change
  useEffect(() => {
    if (!viewerWeeks.length) return;
    const newLessons: { [weekId: number]: SimpleLesson[] } = {};
    const newLoading: { [weekId: number]: boolean } = {};
    const newError: { [weekId: number]: string | null } = {};
    viewerWeeks.forEach(week => {
      newLoading[week.id] = true;
      newError[week.id] = null;
      fetch(`/api/weeklessons/week/${week.id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch lessons');
          return res.json();
        })
        .then(data => {
          setViewerWeekLessons(prev => ({ ...prev, [week.id]: (Array.isArray(data) ? data : []).map((l: any) => ({ id: l.id || l.lessonid, title: l.title })) }));
          setViewerLoadingLessons(prev => ({ ...prev, [week.id]: false }));
        })
        .catch(err => {
          setViewerErrorLessons(prev => ({ ...prev, [week.id]: 'Error fetching lessons' }));
          setViewerLoadingLessons(prev => ({ ...prev, [week.id]: false }));
        });
    });
    setViewerLoadingLessons(newLoading);
    setViewerErrorLessons(newError);
  }, [viewerWeeks]);

  // Add this function inside LessonPlanPage component:
  const handleDeleteLessonFromWeek = async (weekId: number, weekLessonId: number) => {
    try {
      const res = await fetch(`/api/weeklessons/${weekLessonId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete lesson from week');
      toast({ title: 'Success', description: 'Lesson removed from week!' });
      // Refresh weekLessons for this week
      const wlRes = await fetch(`/api/weeklessons/week/${weekId}`);
      const wlData = await wlRes.json();
      setWeekLessons(prev => ({ ...prev, [weekId]: Array.isArray(wlData) ? wlData : [] }));
    } catch (err) {
      toast({ title: 'Error', description: 'Could not remove lesson from week', variant: 'destructive' });
    }
  };

  // 1. Add state for delete dialog for week lesson
  const [deleteWeekLessonDialogOpen, setDeleteWeekLessonDialogOpen] = useState(false);
  const [deleteWeekLessonData, setDeleteWeekLessonData] = useState<{ weekId: number, weekLessonId: number } | null>(null);

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
                                {(content.qaqfLevel || content.level || content.qaqf_level) && QAQF_LEVELS[content.qaqfLevel || content.level || content.qaqf_level]
                                  ? `QAQF ${content.qaqfLevel || content.level || content.qaqf_level}: ${QAQF_LEVELS[content.qaqfLevel || content.level || content.qaqf_level]}`
                                  : `N/A (qaqfLevel: ${content.qaqfLevel}, level: ${content.level}, qaqf_level: ${content.qaqf_level})`}
                              </div>
                              <div><b>User ID:</b> {content.userid}</div>
                              <div><b>Course ID:</b> {content.courseid}</div>
                              <div>
                                <b>Description:</b> {content.description.replace(/<[^>]+>/g, '')}
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
                    {filteredLessons.map(week => (
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
                                setEditWeekDialogOpen(true);
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
                              // Immediately update UI to show the module on the right side
                              setAssignedModules(prev => ({
                                ...prev,
                                [week.id]: [...(prev[week.id] || []), module]
                              }));
                              // Remove from left side immediately
                              setModules(prev => prev.filter(m => m.id !== module.id));
                              // Then call the API to save to backend
                              await assignModuleToWeek(module, week);
                              await fetchWeekModules(week.id); // <-- fetch fresh modules for this week
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
                                // Find the current order
                                const oldIndex = weekLessons[week.id].findIndex((l: any) => l.id === active.id);
                                const newIndex = weekLessons[week.id].findIndex((l: any) => l.id === over.id);
                                if (oldIndex === -1 || newIndex === -1) return;
                                // Reorder in UI
                                const newLessons = arrayMove(weekLessons[week.id], oldIndex, newIndex);
                                setWeekLessons((prev) => ({ ...prev, [week.id]: newLessons }));
                                // Prepare order payload for API
                                const orderPayload = newLessons.map((l: any, idx: number) => ({
                                  id: l.id, // Make sure this is the weeklesson id
                                  orderno: idx + 1,
                                }));
                                // Defensive: filter out any items missing id or orderno
                                const validOrderPayload = orderPayload.filter(item => item.id !== undefined && item.orderno !== undefined);
                                await fetch('/api/weeklessonsorders', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(validOrderPayload), // <-- direct array, not wrapped in any object
                                });
                                toast({ title: 'Order updated!' });
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
                                            <span>{found ? found.title : "No Title"}</span>
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
      {/* Add Week Dialog (appears at bottom) */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="fixed left-1/2 bottom-8 top-auto -translate-x-1/2 w-full max-w-md">
          <DialogHeader>
            <DialogTitle>Add Week</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Title input */}
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
      {/* Module Edit Dialog */}
      <Dialog open={editModuleDialogOpen} onOpenChange={setEditModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Course ID input */}
            <input
              className="border rounded px-2 py-1 w-full"
              value={newModuleCourseId}
              onChange={e => setNewModuleCourseId(e.target.value)}
              placeholder="Course ID"
              autoFocus
            />
            {/* User ID input */}
            <input
              className="border rounded px-2 py-1 w-full"
              value={editModuleDialogUserId || ""}
              onChange={e => setEditModuleDialogUserId(e.target.value)}
              placeholder="User ID"
            />
            {/* Type input */}
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
            {/* Title input */}
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
            <JoditEditor
              value={editModuleDialogDescription}
              config={{ readonly: false, height: 250, width: '100%' }}
              tabIndex={1}
              onBlur={newContent => setEditModuleDialogDescription(newContent)}
              onChange={() => { }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleEditModuleDialogSave}>Save</Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Module Dialog */}
      <Dialog open={addModuleDialogOpen} onOpenChange={setAddModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Type input */}
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
            </select>

            {/* باقی inputs جیسا کہ پہلے تھے */}
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
            {/* Replace textarea with JoditEditor for Script */}
            <JoditEditor
              ref={editor}
              value={newModuleDescription}
              config={{ readonly: false, height: 250, width: '100%' }}
              tabIndex={1}
              onBlur={newContent => setNewModuleDescription(newContent)}
              onChange={() => { }}
            />
          </div>
          <DialogFooter>
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

      {/* Add Course Dialog */}
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
              value={courseForm.userid}
              disabled
              placeholder="User ID"
            />
            {/* Remove JoditEditor here */}
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
                toast({ title: "Success", description: "Course added!" });
                setAddCourseDialogOpen(false);
                setCourseForm({ title: "", userid: "", description: "", status: "" });
              } catch (err) {
                toast({ title: "Error", description: "Could not add course", variant: "destructive" });
              }
            }}>Add</Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
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
              {/* title */}
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

      {/* Add Weeks Dialog */}
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

      {/* Delete Confirmation Dialog */}
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

      {/* Delete Module Confirmation Dialog */}
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
                    setWeeks(weeks => weeks.map(week =>
                      week.id === deleteModuleTarget.weekId
                        ? { ...week, modules: week.modules.filter((mod: any) => mod.id !== deleteModuleTarget.moduleId) }
                        : week
                    ));
                    setDeleteModuleDialogOpen(false);
                    setDeleteModuleTarget(null);
                  }
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

      {/* Right Side Module Edit Dialog */}
      <Dialog open={rightSideEditDialogOpen} onOpenChange={setRightSideEditDialogOpen}>
        <DialogContent>
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
            <JoditEditor
              value={rightSideEditForm.description}
              config={{ readonly: false, height: 250, width: '100%' }}
              tabIndex={1}
              onBlur={newContent => setRightSideEditForm(f => ({ ...f, description: newContent }))}
              onChange={() => { }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleSaveRightSideModuleEdit}>Save</Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Right Side Module Delete Dialog */}
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

      {/* Edit Week Dialog */}
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

      {/* Delete Week Dialog */}
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
                  await deleteWeekById(deleteWeekData.id);
                  setDeleteWeekDialogOpen(false);
                  setDeleteWeekData(null);
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

      {/* Add the delete confirmation dialog for week lesson */}
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

function DraggableModule({ content, setSelectedModuleForView }: { content: any, setSelectedModuleForView: (data: any) => void }) {
  return (
    <div
      key={content.id}
      className="border rounded-md p-3 bg-neutral-50 hover:shadow-sm transition-all cursor-move"
      draggable
      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('moduleId', content.id);
      }}
    >
      <div className="flex justify-between mb-1">
        <h6 className="font-medium">{content.title}</h6>
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
          {/* 👁️ Eye icon for view */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 ml-1"
            onClick={e => {
              e.stopPropagation();
              setSelectedModuleForView(content);
            }}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>{content.type}</span>
        <span>{content.duration}</span>
      </div>
    </div>
  );
}

function DroppableWeek({ week, children }: { week: any, children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: DROPPABLE_PREFIX + week.id,
  });
  return (
    <div
      ref={setNodeRef}
      className={`border rounded-md overflow-hidden ${isOver ? 'bg-green-100' : ''}`}
    >
      {children}
    </div>
  );
}

export default LessonPlanPage;

// Add new component for assigned modules with edit/delete icons
function AssignedModule({ module, onEdit, onDelete, setSelectedModuleForView }: {
  module: any,
  onEdit: (module: any) => void,
  onDelete: (module: any) => void,
  setSelectedModuleForView: (module: any) => void
}) {
  return (
    <div className="border rounded p-2 bg-blue-50 text-xs relative group cursor-default">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-medium text-sm">{module.title}</div>
          <div className="text-neutral-500 text-xs">
            {module.type} • {module.duration} • QAQF {module.qaqfLevel || module.level || module.qaqf_level}: {QAQF_LEVELS[module.qaqfLevel || module.level || module.qaqf_level]}
          </div>
        </div>
        {/* Remove icon buttons from here */}
      </div>
    </div>
  );
}

// Fix linter errors for ModulePreviewContainer
function ModulePreviewContainer({ summary, details }: { summary: React.ReactNode; details: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        detailsRef.current &&
        !detailsRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative w-full max-w-2xl mx-auto my-4">
      {/* Header/Summary (red box) */}
      <div className="bg-white rounded-t-lg shadow p-4 flex items-center justify-between">
        <div>{summary}</div>
        <button
          className="text-gray-500 hover:text-blue-600"
          onClick={() => setOpen((o) => !o)}
          aria-label="Show details"
        >
          <span className="material-icons">visibility</span>
        </button>
      </div>
      {/* Details (yellow box) */}
      {open && (
        <div
          ref={detailsRef}
          className="absolute left-0 right-0 z-10 bg-white rounded-b-lg shadow-lg border-t border-gray-200 p-6 animate-slideDown"
          style={{ top: "100%" }}
        >
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
          {details}
        </div>
      )}
      <style>
        {`
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .animate-slideDown {
            animation: slideDown 0.2s ease;
          }
        `}
      </style>
    </div>
  );
}

// Fix linter errors for SortableAssignedModule
interface SortableAssignedModuleProps {
  module: any;
  onEdit: (module: any) => void;
  onDelete: (module: any) => void;
  setSelectedModuleForView: (module: any) => void;
}
function SortableAssignedModule({ module, onEdit, onDelete, setSelectedModuleForView }: SortableAssignedModuleProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: module.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        background: '#e9f1ff',
        marginBottom: 8,
      }}
      {...attributes}
      {...listeners}
    >
      <AssignedModule
        module={module}
        onEdit={onEdit}
        onDelete={onDelete}
        setSelectedModuleForView={setSelectedModuleForView}
      />
    </div>
  );
}

// 1. Add SortableLesson component near the bottom (if not already present)
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