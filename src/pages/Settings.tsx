import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Shield, Users, Settings as SettingsIcon, ClipboardList, Search, RefreshCw, User, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';

interface UserWithRole {
  id: string;
  full_name: string | null;
  position: string | null;
  role: 'admin' | 'user';
}

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  old_data: unknown;
  new_data: unknown;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user_name?: string;
}

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  
  // Audit log state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState<string>('all');

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchAuditLogs();
    }
  }, [isAdmin]);

  async function fetchUsers() {
    setLoadingUsers(true);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, position');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      setLoadingUsers(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      setLoadingUsers(false);
      return;
    }

    const usersWithRoles: UserWithRole[] = profiles.map((profile) => {
      const userRole = roles.find((r) => r.user_id === profile.id);
      return {
        id: profile.id,
        full_name: profile.full_name,
        position: profile.position,
        role: (userRole?.role as 'admin' | 'user') || 'user',
      };
    });

    setUsers(usersWithRoles);
    setLoadingUsers(false);
  }

  async function fetchAuditLogs() {
    setLoadingLogs(true);
    
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to fetch audit logs');
      setLoadingLogs(false);
      return;
    }

    // Fetch user profiles for display names
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name');

    const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

    const logsWithNames: AuditLog[] = (logs || []).map((log) => ({
      ...log,
      user_name: log.user_id ? (profileMap.get(log.user_id) || 'Unknown User') : 'System',
    }));

    setAuditLogs(logsWithNames);
    setLoadingLogs(false);
  }

  async function updateUserRole(userId: string, newRole: 'admin' | 'user') {
    setUpdatingRole(userId);

    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to update user role');
      console.error(error);
    } else {
      toast.success('User role updated successfully');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      
      // Log the role change
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'role_change',
        table_name: 'user_roles',
        record_id: userId,
        new_data: { role: newRole },
      });
      
      fetchAuditLogs();
    }

    setUpdatingRole(null);
  }

  // Format table name for display
  const formatTableName = (tableName: string | null): string => {
    if (!tableName) return 'record';
    const names: Record<string, string> = {
      vehicles: 'vehicle',
      drivers: 'driver',
      trip_tickets: 'trip ticket',
      travel_orders: 'travel order',
      inventory_items: 'inventory item',
      inventory_categories: 'inventory category',
      buildings: 'building',
      generators: 'generator',
      vehicle_maintenance_checklists: 'vehicle maintenance checklist',
      building_maintenance_checklists: 'building maintenance checklist',
      generator_maintenance_checklists: 'generator maintenance checklist',
      profiles: 'profile',
      user_roles: 'user role',
    };
    return names[tableName] || tableName.replace(/_/g, ' ');
  };

  // Get human-readable description of the action
  const getActionDescription = (log: AuditLog): string => {
    const tableName = formatTableName(log.table_name);
    const newData = log.new_data as Record<string, unknown> | null;
    const oldData = log.old_data as Record<string, unknown> | null;
    
    // Get a meaningful identifier from the data
    const getIdentifier = (data: Record<string, unknown> | null): string => {
      if (!data) return '';
      // Try common identifier fields
      const identifierFields = ['name', 'full_name', 'plate_no', 'tr_no', 'travel_order_no', 'product_id', 'building_name', 'equipment_name', 'title'];
      for (const field of identifierFields) {
        if (data[field]) return ` "${data[field]}"`;
      }
      return '';
    };

    switch (log.action) {
      case 'insert':
        return `Created ${tableName}${getIdentifier(newData)}`;
      case 'update':
        // Find what fields changed
        if (newData && oldData) {
          const changedFields = Object.keys(newData).filter(
            key => JSON.stringify(newData[key]) !== JSON.stringify(oldData[key]) && 
                   !['updated_at', 'created_at'].includes(key)
          );
          if (changedFields.length > 0 && changedFields.length <= 3) {
            return `Updated ${changedFields.join(', ')} in ${tableName}${getIdentifier(newData)}`;
          }
        }
        return `Updated ${tableName}${getIdentifier(newData)}`;
      case 'delete':
        return `Deleted ${tableName}${getIdentifier(oldData)}`;
      case 'role_change':
        const newRole = newData?.role;
        return `Changed user role to ${newRole}`;
      case 'login':
        return 'Logged in';
      case 'logout':
        return 'Logged out';
      default:
        return log.action.replace(/_/g, ' ');
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = logSearch === '' || 
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.table_name?.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(logSearch.toLowerCase()) ||
      getActionDescription(log).toLowerCase().includes(logSearch.toLowerCase());
    
    const matchesFilter = logFilter === 'all' || log.action === logFilter;
    
    return matchesSearch && matchesFilter;
  });

  const uniqueActions = [...new Set(auditLogs.map(log => log.action))];

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1b2a]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1b2a] via-[#1b263b] to-[#0d1b2a]">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Title Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
            <SettingsIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-white/60">Manage your account and system settings</p>
          </div>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1">
            <TabsTrigger 
              value="account" 
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white text-white/70"
            >
              <Shield className="h-4 w-4" />
              Account
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger 
                  value="users" 
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white text-white/70"
                >
                  <Users className="h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger 
                  value="audit" 
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white text-white/70"
                >
                  <ClipboardList className="h-4 w-4" />
                  Audit Logs
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="account">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white">Account Information</CardTitle>
                <CardDescription className="text-white/60">Your account details and role</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/60">Email Address</p>
                    <p className="text-white font-medium">{user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/60">Role</p>
                    <Badge 
                      variant={isAdmin ? 'default' : 'secondary'}
                      className={isAdmin ? 'bg-primary text-white' : 'bg-white/10 text-white/80'}
                    >
                      {isAdmin ? 'Administrator' : 'User'}
                    </Badge>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate('/profile')}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="users">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="text-white">User Management</CardTitle>
                  <CardDescription className="text-white/60">Manage user roles and permissions</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-white/60">Name</TableHead>
                            <TableHead className="text-white/60">Position</TableHead>
                            <TableHead className="text-white/60">Role</TableHead>
                            <TableHead className="text-white/60 w-[150px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((u) => (
                            <TableRow key={u.id} className="border-white/10 hover:bg-white/5">
                              <TableCell className="font-medium text-white">
                                {u.full_name || 'Unnamed'}
                              </TableCell>
                              <TableCell className="text-white/70">{u.position || '-'}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={u.role === 'admin' ? 'default' : 'secondary'}
                                  className={u.role === 'admin' ? 'bg-primary text-white' : 'bg-white/10 text-white/80'}
                                >
                                  {u.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {u.id !== user?.id ? (
                                  <Select
                                    value={u.role}
                                    onValueChange={(value: 'admin' | 'user') =>
                                      updateUserRole(u.id, value)
                                    }
                                    disabled={updatingRole === u.id}
                                  >
                                    <SelectTrigger className="w-[120px] bg-white/5 border-white/20 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="user">User</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <span className="text-sm text-white/50 italic">
                                    (You)
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="audit">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader className="border-b border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-white">Audit Logs</CardTitle>
                      <CardDescription className="text-white/60">View all system activity and changes</CardDescription>
                    </div>
                    <Button
                      size="sm"
                      onClick={fetchAuditLogs}
                      disabled={loadingLogs}
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loadingLogs ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                      <Input
                        placeholder="Search logs..."
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                        className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                    <Select value={logFilter} onValueChange={setLogFilter}>
                      <SelectTrigger className="w-[180px] bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Filter by action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        {uniqueActions.map((action) => (
                          <SelectItem key={action} value={action}>
                            {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {loadingLogs ? (
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-12 text-white/50">
                      <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No audit logs found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredLogs.map((log) => (
                        <div 
                          key={log.id} 
                          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium">
                                {getActionDescription(log)}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-sm">
                                <span className="text-white/60">by {log.user_name}</span>
                                <span className="text-white/30">•</span>
                                <span className="text-white/50">
                                  {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                                </span>
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`shrink-0 border-white/20 ${
                                log.action === 'insert' ? 'text-green-400 border-green-400/30' :
                                log.action === 'update' ? 'text-blue-400 border-blue-400/30' :
                                log.action === 'delete' ? 'text-red-400 border-red-400/30' :
                                'text-white/70'
                              }`}
                            >
                              {log.action.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
