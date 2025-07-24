import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { useToast } from "../hooks/use-toast";
// import { Link } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
// import { useProfile } from '../contexts/UserProfileContext';

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [contentVerified, setContentVerified] = useState(true);
  const [contentRejected, setContentRejected] = useState(true);
  const [newComments, setNewComments] = useState(true);
  
  // API Key Management
  const [apiKey, setApiKey] = useState("••••••••••••••••••••••");
  
  // Appearance settings
  const [theme, setTheme] = useState("light");

  const { logout, user } = useAuth();

  const handleSaveProfile = () => {
    setIsSaving(true);
    
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Profile Updated",
        description: "Your profile settings have been saved successfully.",
      });
    }, 1000);
  };

  const handleRegenerateApiKey = () => {
    // Simulate API key regeneration
    setTimeout(() => {
      setApiKey("••••••••••••••••••••••");
      toast({
        title: "API Key Regenerated",
        description: "Your new API key has been generated. Keep it secure!",
      });
    }, 500);
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
                      <Input id="institution" value={user?.institution || ''} readOnly />
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
