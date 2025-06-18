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

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [name, setName] = useState("Dr. Jane Doe");
  const [email, setEmail] = useState("jane.doe@example.com");
  const [institution, setInstitution] = useState("University of Example");
  const [role, setRole] = useState("Academic Moderator");
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
                    JD
                  </div>
                  <h3 className="font-medium text-lg">{name}</h3>
                  <p className="text-neutral-500 text-sm">{role}</p>
                </div>
                
                <Separator />
                
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Settings</h4>
                  <Button variant="ghost" className="w-full justify-start">
                    <span className="material-icons mr-2 text-sm">person</span>
                    Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <span className="material-icons mr-2 text-sm">notifications</span>
                    Notifications
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <span className="material-icons mr-2 text-sm">vpn_key</span>
                    API Access
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <span className="material-icons mr-2 text-sm">brush</span>
                    Appearance
                  </Button>
                </div>
                
                <Separator />
                
                <Button variant="outline" className="w-full">
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
              <TabsTrigger value="api">API Access</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
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
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="institution">Institution</Label>
                      <Input id="institution" value={institution} onChange={(e) => setInstitution(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} />
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
            
            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>API Access</CardTitle>
                  <CardDescription>Manage your API keys and access to the QAQF platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="api-key">Your API Key</Label>
                    <div className="flex">
                      <Input 
                        id="api-key" 
                        value={apiKey} 
                        readOnly 
                        className="flex-1 font-mono bg-neutral-50"
                      />
                      <Button variant="outline" className="ml-2" onClick={handleRegenerateApiKey}>
                        Regenerate
                      </Button>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Keep your API key secure. Do not share it publicly.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">API Access Permissions</h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="content-access" className="flex-1">Content Generation API</Label>
                        <Switch id="content-access" checked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="verification-access" className="flex-1">Verification API</Label>
                        <Switch id="verification-access" checked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="assessment-access" className="flex-1">Assessment API</Label>
                        <Switch id="assessment-access" checked={true} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Customize how the QAQF platform looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Theme</h4>
                    <RadioGroup value={theme} onValueChange={setTheme}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="light" />
                        <Label htmlFor="light">Light</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="dark" />
                        <Label htmlFor="dark">Dark</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="system" id="system" />
                        <Label htmlFor="system">System</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Display Options</h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="compact-view" className="flex-1">Compact View</Label>
                        <Switch id="compact-view" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="high-contrast" className="flex-1">High Contrast</Label>
                        <Switch id="high-contrast" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="animations" className="flex-1">Animations</Label>
                        <Switch id="animations" checked={true} />
                      </div>
                    </div>
                  </div>
                  
                  <Button>Save Appearance Settings</Button>
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
