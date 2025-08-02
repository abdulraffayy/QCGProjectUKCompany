import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { toast } from "react-toastify";
import { useAuth } from '../contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

// Admin form schema
const adminSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["user", "admin", "verification", "moderation"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AdminForm = z.infer<typeof adminSchema>;

const SettingsPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [contentVerified, setContentVerified] = useState(true);
  const [contentRejected, setContentRejected] = useState(true);
  const [newComments, setNewComments] = useState(true);
  
  // API Key Management

  


  const { logout, user } = useAuth();

  // Form setup for admin tab
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdminForm>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      role: "user",
    },
  });

  // Admin mutation
  const adminMutation = useMutation({
    mutationFn: async (data: AdminForm) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          name: data.name,
          role: data.role,
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: await response.text() };
        }
        throw new Error(errorData.error || errorData.detail || "Account creation failed");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      console.log("Account created successfully:", data);
      
      // Show success toast with role-specific message
      const roleName = variables.role.charAt(0).toUpperCase() + variables.role.slice(1);
      toast.success(`${roleName} account created successfully`);
     

      if (variables.role === "admin" || variables.role === "verification") {
        setLocation("/login")
      }
    },
    onError: (error: Error, variables) => {
      console.log("Account creation error:", error);
      
      let errorMessage = "Account creation failed. Please try again.";
      
      // Handle specific error cases for duplicate email
      if (error.message.includes("Email already registered") || 
          error.message.includes("Email already exists") ||
          error.message.includes("already registered")) {
        errorMessage = "This email is already registered. Please use a different email address.";
      } else if (error.message.includes("Username already registered") || 
                 error.message.includes("Username already exists")) {
        errorMessage = "This username is already taken. Please choose a different username.";
      } else if (error.message.includes("Username or email already exists")) {
        errorMessage = "This username or email is already registered. Please use different credentials.";
      }
      
      // Add role-specific context to error message
      const roleName = variables?.role ? variables.role.charAt(0).toUpperCase() + variables.role.slice(1) : "User";
      const roleSpecificError = `${roleName} account creation failed: ${errorMessage}`;
      
      toast.error(roleSpecificError);
      console.log("Error toast shown:", roleSpecificError);
    },
  });

  const onSubmit = (data: AdminForm) => {
    adminMutation.mutate(data);
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile settings have been saved successfully");
      console.log("Profile settings saved successfully");
    }, 1000);
  };

 

  function getInitials(name: string | undefined) {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.length === 1 ? parts[0][0] : parts[0][0] + parts[parts.length - 1][0];
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Settings</h2>
            <p className="text-neutral-600 mt-1">Manage your account preferences and platform settings</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4 pt-2">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2">
                    {getInitials(user?.name)}
                  </div>
                  <h3 className="font-medium text-lg">{user?.name || ''}</h3>
                  <p className="text-neutral-500 text-sm">{user?.role || ''}</p>
                </div>
                <Separator />
                <Button variant="outline" className="w-full" onClick={logout}>
                  <span className="material-icons mr-2 text-sm">logout</span>
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Manage your personal information and account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={user?.name || ''} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" value={user?.email || ''} readOnly />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div>
                       <Label htmlFor="institution">Institution</Label>
                       <Input id="institution" value="" readOnly />
                     </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" value={user?.role || ''} readOnly />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <textarea 
                      id="bio" 
                      className="w-full min-h-[100px] p-2 border border-input rounded-md"
                      placeholder="Tell us about yourself"
                    ></textarea>
                  </div>
                  
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

                         <TabsContent value="admin"> 
               <Card>
                 <CardHeader>
                   <CardTitle>Admin Settings</CardTitle>
                   <CardDescription>Create new user accounts</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <Label htmlFor="name">Full Name</Label>
                         <Input
                           id="name"
                           type="text"
                           placeholder="Enter full name"
                           {...register("name")}
                           className={errors.name ? "border-red-500" : ""}
                         />
                         {errors.name && (
                           <p className="text-sm text-red-500">{errors.name.message}</p>
                         )}
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="username">Username</Label>
                         <Input
                           id="username"
                           type="text"
                           placeholder="Choose username"
                           {...register("username")}
                           className={errors.username ? "border-red-500" : ""}
                         />
                         {errors.username && (
                           <p className="text-sm text-red-500">{errors.username.message}</p>
                         )}
                       </div>
                     </div>
                   
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <Label htmlFor="email">Email Address</Label>
                         <Input
                           id="email"
                           type="email"
                           placeholder="Enter email address"
                           {...register("email")}
                           className={errors.email ? "border-red-500" : ""}
                         />
                         {errors.email && (
                           <p className="text-sm text-red-500">{errors.email.message}</p>
                         )}
                       </div>
                       <div className="space-y-2">
                         <Label htmlFor="role">Role</Label>
                         <Select onValueChange={(value) => setValue("role", value as "user" | "admin" | "verification" | "moderation")}>
                           <SelectTrigger>
                             <SelectValue placeholder="Select role" />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="admin">Admin</SelectItem>
                             <SelectItem value="verification">Verification</SelectItem>
                             <SelectItem value="moderation">Moderation</SelectItem>
                           </SelectContent>
                         </Select>
                         {errors.role && (
                           <p className="text-sm text-red-500">{errors.role.message}</p>
                         )}
                       </div>
                     </div>
                   
                     <div className="space-y-2">
                       <Label htmlFor="password">Password</Label>
                       <Input
                         id="password"
                         type="password"
                         placeholder="Enter password"
                         {...register("password")}
                         className={errors.password ? "border-red-500" : ""}
                       />
                       {errors.password && (
                         <p className="text-sm text-red-500">{errors.password.message}</p>
                       )}
                     </div>

                     <div className="space-y-2">
                       <Label htmlFor="confirmPassword">Confirm Password</Label>
                       <Input
                         id="confirmPassword"
                         type="password"
                         placeholder="Confirm password"
                         {...register("confirmPassword")}
                         className={errors.confirmPassword ? "border-red-500" : ""}
                       />
                       {errors.confirmPassword && (
                         <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                       )}
                     </div>
                   
                     <Button type="submit" disabled={adminMutation.isPending}>
                       {adminMutation.isPending ? 'Creating Account...' : 'Create Account'}
                     </Button>
                   </form>
                 </CardContent>
               </Card>
             </TabsContent>
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how you receive notifications and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications" className="flex-1">Email Notifications</Label>
                    <Switch 
                      id="email-notifications" 
                      checked={emailNotifications} 
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notification Types</h4>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="content-verified" className="flex-1">When my content is verified</Label>
                      <Switch 
                        id="content-verified" 
                        checked={contentVerified} 
                        onCheckedChange={setContentVerified}
                        disabled={!emailNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="content-rejected" className="flex-1">When my content is rejected</Label>
                      <Switch 
                        id="content-rejected" 
                        checked={contentRejected} 
                        onCheckedChange={setContentRejected}
                        disabled={!emailNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="new-comments" className="flex-1">New comments on my content</Label>
                      <Switch 
                        id="new-comments" 
                        checked={newComments} 
                        onCheckedChange={setNewComments}
                        disabled={!emailNotifications}
                      />
                    </div>
                  </div>
                  <Button>Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>            
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
