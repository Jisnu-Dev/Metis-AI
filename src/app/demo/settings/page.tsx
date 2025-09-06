'use client';

import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  Database, 
  Globe, 
  Palette, 
  Download, 
  Trash2, 
  Key, 
  Settings as SettingsIcon,
  ChevronRight,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Clock,
  BarChart3,
  FileText,
  Lock,
  Unlock,
  Monitor,
  Moon,
  Sun,
  Zap,
  HardDrive,
  Cloud,
  Wifi,
  Activity
} from 'lucide-react';
import { useState } from 'react';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface DataUsageStat {
  category: string;
  usage: number;
  total: number;
  unit: string;
  color: string;
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { id: 'email', title: 'Email Notifications', description: 'Receive updates via email', enabled: true },
    { id: 'push', title: 'Push Notifications', description: 'Browser push notifications', enabled: false },
    { id: 'sms', title: 'SMS Alerts', description: 'Critical alerts via SMS', enabled: false },
    { id: 'reports', title: 'Weekly Reports', description: 'Weekly analysis summaries', enabled: true },
    { id: 'projects', title: 'Project Updates', description: 'Notifications for project changes', enabled: true },
    { id: 'system', title: 'System Maintenance', description: 'System update notifications', enabled: true }
  ]);

  const [darkMode, setDarkMode] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [dataRetention, setDataRetention] = useState('12');
  const [apiUsage, setApiUsage] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('weekly');

  const settingSections: SettingSection[] = [
    {
      id: 'profile',
      title: 'User Profile',
      description: 'Manage your personal information and account details',
      icon: <User className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure how you receive updates and alerts',
      icon: <Bell className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Manage security settings and data privacy',
      icon: <Shield className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'data',
      title: 'Data Management',
      description: 'Control data storage, export, and retention',
      icon: <Database className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your experience and interface',
      icon: <Palette className="w-5 h-5" />,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'system',
      title: 'System Settings',
      description: 'Advanced configuration and performance settings',
      icon: <SettingsIcon className="w-5 h-5" />,
      color: 'from-gray-500 to-slate-500'
    }
  ];

  const dataUsageStats: DataUsageStat[] = [
    { category: 'Projects', usage: 12, total: 50, unit: 'projects', color: 'bg-blue-500' },
    { category: 'Storage', usage: 2.4, total: 10, unit: 'GB', color: 'bg-purple-500' },
    { category: 'API Calls', usage: 1250, total: 5000, unit: 'calls', color: 'bg-green-500' },
    { category: 'Reports', usage: 8, total: 25, unit: 'reports', color: 'bg-orange-500' }
  ];

  const toggleNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
      )
    );
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Picture */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Profile Picture
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              JD
            </div>
            <div>
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Change Photo
              </button>
              <p className="text-gray-400 text-xs mt-2">JPG, PNG up to 5MB</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-green-400" />
            Contact Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input 
                type="email" 
                defaultValue="jdoe@metalcorp.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
              <input 
                type="tel" 
                defaultValue="+1 (555) 123-4567"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-purple-400" />
          Personal & Organization Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input 
              type="text" 
              defaultValue="John Doe"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Job Title</label>
            <input 
              type="text" 
              defaultValue="Senior Metallurgical Engineer"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Organization</label>
            <input 
              type="text" 
              defaultValue="MetalCorp Industries"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Sustainability & LCA</option>
              <option>Production Engineering</option>
              <option>Quality Assurance</option>
              <option>Research & Development</option>
              <option>Environmental Compliance</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
            <input 
              type="text" 
              defaultValue="Pittsburgh, PA, United States"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-400" />
          Notification Preferences
        </h3>
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div key={notif.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <h4 className="font-medium text-white">{notif.title}</h4>
                <p className="text-sm text-gray-400">{notif.description}</p>
              </div>
              <button
                onClick={() => toggleNotification(notif.id)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notif.enabled ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notif.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Timing */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-400" />
          Notification Timing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Quiet Hours Start</label>
            <input 
              type="time" 
              defaultValue="22:00"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Quiet Hours End</label>
            <input 
              type="time" 
              defaultValue="08:00"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      {/* Password & Authentication */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-green-400" />
          Password & Authentication
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pr-10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter current password"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
            <input 
              type="password"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <input 
              type="password"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm new password"
            />
          </div>
          <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Update Password
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          Two-Factor Authentication
        </h3>
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div>
            <h4 className="font-medium text-white">SMS Authentication</h4>
            <p className="text-sm text-gray-400">Receive verification codes via SMS</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Enable
          </button>
        </div>
      </div>

      {/* Session Management */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-400" />
          Active Sessions
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-green-400" />
              <div>
                <p className="font-medium">Current Session</p>
                <p className="text-sm text-gray-400">Windows • Chrome • Pittsburgh, PA</p>
              </div>
            </div>
            <span className="text-green-400 text-sm font-medium">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-400" />
              <div>
                <p className="font-medium">Mobile Device</p>
                <p className="text-sm text-gray-400">iOS • Safari • 2 hours ago</p>
              </div>
            </div>
            <button className="text-red-400 hover:text-red-300 text-sm font-medium">
              Terminate
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSection = () => (
    <div className="space-y-6">
      {/* Data Usage Overview */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Data Usage Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataUsageStats.map((stat, index) => (
            <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{stat.category}</span>
                <span className="text-sm text-gray-400">
                  {stat.usage} / {stat.total} {stat.unit}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`${stat.color} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${(stat.usage / stat.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-green-400" />
          Data Export
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <h4 className="font-medium">Export All Projects</h4>
              <p className="text-sm text-gray-400">Download all your LCA projects and data</p>
            </div>
            <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Export
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <h4 className="font-medium">Export Reports</h4>
              <p className="text-sm text-gray-400">Download generated reports and analytics</p>
            </div>
            <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Data Retention */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-purple-400" />
          Data Retention Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Data Retention Period</label>
            <select 
              value={dataRetention}
              onChange={(e) => setDataRetention(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="6">6 months</option>
              <option value="12">12 months</option>
              <option value="24">24 months</option>
              <option value="36">36 months</option>
              <option value="indefinite">Indefinite</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">Data older than this period will be automatically deleted</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Backup Frequency</label>
            <select 
              value={backupFrequency}
              onChange={(e) => setBackupFrequency(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="manual">Manual only</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-6">
      {/* Interface Preferences */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-400" />
          Interface Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-blue-400" />
              <div>
                <h4 className="font-medium">Dark Mode</h4>
                <p className="text-sm text-gray-400">Use dark theme across the application</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Save className="w-5 h-5 text-green-400" />
              <div>
                <h4 className="font-medium">Auto-save</h4>
                <p className="text-sm text-gray-400">Automatically save changes as you work</p>
              </div>
            </div>
            <button
              onClick={() => setAutoSave(!autoSave)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                autoSave ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  autoSave ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Language & Region */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" />
          Language & Region
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Language</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Chinese (Simplified)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Timezone</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>UTC-5 (Eastern Time)</option>
              <option>UTC-6 (Central Time)</option>
              <option>UTC-7 (Mountain Time)</option>
              <option>UTC-8 (Pacific Time)</option>
              <option>UTC+0 (GMT)</option>
              <option>UTC+1 (CET)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Date Format</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Number Format</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>1,234.56</option>
              <option>1.234,56</option>
              <option>1 234,56</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSection = () => (
    <div className="space-y-6">
      {/* API Configuration */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          API Configuration
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <h4 className="font-medium">API Usage Monitoring</h4>
              <p className="text-sm text-gray-400">Track API calls and performance metrics</p>
            </div>
            <button
              onClick={() => setApiUsage(!apiUsage)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                apiUsage ? 'bg-yellow-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  apiUsage ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">API Rate Limit</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Standard (100 calls/hour)</option>
              <option>Enhanced (500 calls/hour)</option>
              <option>Premium (1000 calls/hour)</option>
              <option>Unlimited</option>
            </select>
          </div>
        </div>
      </div>

      {/* Performance Settings */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Performance Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Cache Duration</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>1 hour</option>
              <option>6 hours</option>
              <option>24 hours</option>
              <option>7 days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Concurrent Processes</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>2 processes</option>
              <option>4 processes</option>
              <option>8 processes</option>
              <option>Auto-detect</option>
            </select>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-400" />
          System Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Version:</span>
              <span>v2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Update:</span>
              <span>Sep 1, 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">License:</span>
              <span>Enterprise</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Uptime:</span>
              <span>99.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Server:</span>
              <span>US-East-1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="text-green-400">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'security':
        return renderSecuritySection();
      case 'data':
        return renderDataSection();
      case 'preferences':
        return renderPreferencesSection();
      case 'system':
        return renderSystemSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-gray-900/50 border-r border-gray-800 flex flex-col">
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-blue-400" />
              Settings
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage your account and preferences</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {settingSections.map((section) => (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r ' + section.color + ' text-white shadow-lg'
                      : 'bg-gray-800/30 hover:bg-gray-800/50 text-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      activeSection === section.id 
                        ? 'bg-white/20' 
                        : 'bg-gray-700'
                    }`}>
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{section.title}</h3>
                      <p className={`text-sm ${
                        activeSection === section.id 
                          ? 'text-white/80' 
                          : 'text-gray-400'
                      }`}>
                        {section.description}
                      </p>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform ${
                      activeSection === section.id ? 'rotate-90' : ''
                    }`} />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="p-4 border-t border-gray-800">
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              Save All Changes
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderActiveSection()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
