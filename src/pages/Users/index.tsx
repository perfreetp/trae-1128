import { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Bell,
  MoreHorizontal,
  Search,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Plus,
  X,
  Save,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDateTime, cn, generateId } from '@/utils';
import type { User } from '@/types';

type TabType = 'users' | 'roles' | 'announcements';

export default function UsersPage() {
  const { users, announcements, addAnnouncement, currentUser, addUser, updateUser, deleteUser, toggleUserActive } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    important: false,
  });
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    department: '',
    phone: '',
    role: 'teacher' as User['role'],
    active: true,
  });

  const tabs: { key: TabType; label: string; icon: any; count: number }[] = [
    { key: 'users', label: '用户管理', icon: Users, count: users.length },
    { key: 'roles', label: '角色配置', icon: Shield, count: 2 },
    { key: 'announcements', label: '通知公告', icon: Bell, count: announcements.length },
  ];

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      department: '',
      phone: '',
      role: 'teacher',
      active: true,
    });
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      department: user.department,
      phone: user.phone,
      role: user.role,
      active: user.active,
    });
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;

    if (editingUser) {
      updateUser(editingUser.id, userForm);
    } else {
      const newUser: User = {
        id: generateId(),
        ...userForm,
      };
      addUser(newUser);
    }
    setShowUserModal(false);
  };

  const handleDeleteUser = (id: string) => {
    deleteUser(id);
    setShowDeleteConfirm(null);
  };

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.content) return;

    const newAnnouncement = {
      id: generateId(),
      title: announcementForm.title,
      content: announcementForm.content,
      authorId: currentUser.id,
      createdAt: new Date().toISOString(),
      important: announcementForm.important,
    };
    addAnnouncement(newAnnouncement);
    setShowAnnouncementModal(false);
    setAnnouncementForm({ title: '', content: '', important: false });
  };

  const permissions = [
    { id: 'device.view', name: '查看设备', category: '设备管理' },
    { id: 'device.edit', name: '编辑设备', category: '设备管理' },
    { id: 'device.delete', name: '删除设备', category: '设备管理' },
    { id: 'reservation.view', name: '查看预约', category: '预约管理' },
    { id: 'reservation.create', name: '创建预约', category: '预约管理' },
    { id: 'reservation.approve', name: '审批预约', category: '预约管理' },
    { id: 'workorder.view', name: '查看工单', category: '维修管理' },
    { id: 'workorder.create', name: '创建工单', category: '维修管理' },
    { id: 'workorder.assign', name: '派单', category: '维修管理' },
    { id: 'statistics.view', name: '查看统计', category: '统计分析' },
    { id: 'user.manage', name: '用户管理', category: '系统管理' },
  ];

  const rolePermissions: Record<string, string[]> = {
    admin: permissions.map((p) => p.id),
    teacher: ['device.view', 'reservation.view', 'reservation.create', 'workorder.view', 'workorder.create', 'statistics.view'],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">人员权限</h1>
        <p className="text-gray-500 mt-1">用户管理、角色配置与通知公告</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 text-sm font-medium relative transition-colors',
                  activeTab === tab.key
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span
                  className={cn(
                    'ml-2 px-2 py-0.5 text-xs rounded-full',
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {tab.count}
                </span>
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索用户姓名、邮箱..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleOpenAddUser}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  添加用户
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户信息</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">部门</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">联系电话</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{user.department}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{user.phone}</td>
                        <td className="px-4 py-4">
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          )}>
                            {user.role === 'admin' ? '管理员' : '教师'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            user.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          )}>
                            {user.active ? '启用' : '禁用'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditUser(user)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="编辑"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleUserActive(user.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title={user.active ? '禁用' : '启用'}
                            >
                              {user.active ? (
                                <ToggleRight className="w-4 h-4 text-green-500" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(user.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">暂无匹配的用户</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">角色列表</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                  <Plus className="w-4 h-4" />
                  新增角色
                </button>
              </div>

              <div className="grid gap-6">
                {[{ id: 'admin', name: '管理员', description: '拥有系统所有权限' }, { id: 'teacher', name: '教师', description: '可预约设备、上报故障' }].map((role) => (
                  <div key={role.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{role.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        编辑权限
                      </button>
                    </div>
                    <div className="space-y-4">
                      {['设备管理', '预约管理', '维修管理', '统计分析', '系统管理'].map((category) => {
                        const categoryPerms = permissions.filter((p) => p.category === category);
                        return (
                          <div key={category}>
                            <p className="text-sm font-medium text-gray-700 mb-2">{category}</p>
                            <div className="flex flex-wrap gap-2">
                              {categoryPerms.map((perm) => {
                                const hasPermission = rolePermissions[role.id]?.includes(perm.id);
                                return (
                                  <span
                                    key={perm.id}
                                    className={cn(
                                      'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium',
                                      hasPermission
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : 'bg-gray-50 text-gray-500 border border-gray-200'
                                    )}
                                  >
                                    {perm.name}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">通知公告</h3>
                <button
                  onClick={() => setShowAnnouncementModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  发布公告
                </button>
              </div>

              <div className="space-y-3">
                {announcements.map((announcement) => {
                  const author = users.find((u) => u.id === announcement.authorId);
                  return (
                    <div
                      key={announcement.id}
                      className={cn(
                        'p-4 rounded-lg border transition-shadow hover:shadow-sm',
                        announcement.important
                          ? 'bg-red-50 border-red-200'
                          : 'bg-white border-gray-200'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {announcement.important && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                                重要
                              </span>
                            )}
                            <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{announcement.content}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span>发布人：{author?.name}</span>
                            <span>{formatDateTime(announcement.createdAt)}</span>
                          </div>
                        </div>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingUser ? '编辑用户' : '添加用户'}</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="请输入姓名"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="请输入邮箱"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">部门</label>
                  <input
                    type="text"
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    placeholder="请输入部门"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                  <input
                    type="tel"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="请输入电话"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as User['role'] })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="teacher">教师</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="userActive"
                  checked={userForm.active}
                  onChange={(e) => setUserForm({ ...userForm, active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="userActive" className="text-sm text-gray-700">启用账号</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingUser ? '保存修改' : '添加用户'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">确认删除</h3>
            <p className="text-gray-600 mb-6">确定要删除该用户吗？此操作不可撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">发布公告</h3>
            <form onSubmit={handlePublishAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">公告标题</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  placeholder="请输入公告标题"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">公告内容</label>
                <textarea
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  placeholder="请输入公告内容..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="important"
                  checked={announcementForm.important}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, important: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="important" className="text-sm text-gray-700">标记为重要公告</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  发布
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
