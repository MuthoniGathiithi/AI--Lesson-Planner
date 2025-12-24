import React, { useState } from 'react';
import { BookOpen, Plus, Clock, FileText, Settings, User, Menu, X, Search, Calendar, TrendingUp, Sparkles, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [lessonPlans, setLessonPlans] = useState([]);
  
  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    topic: '',
    duration: '',
    objectives: ''
  });

  const subjects = ['Mathematics', 'Science', 'English', 'Kiswahili', 'Social Studies', 'Creative Arts'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePlan = () => {
    console.log('Generating lesson plan with:', formData);
    // AI generation logic would go here
  };

  // Calculate stats from lessonPlans
  const totalLessons = lessonPlans.length;
  const thisWeekLessons = lessonPlans.filter(plan => {
    const planDate = new Date(plan.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return planDate >= weekAgo;
  }).length;
  
  const subjectsCovered = [...new Set(lessonPlans.map(plan => plan.subject))].length;

  const stats = [
    { label: 'Total Lessons', value: totalLessons.toString(), icon: FileText, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
    { label: 'This Week', value: thisWeekLessons.toString(), icon: Calendar, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50' },
    { label: 'Subjects Covered', value: subjectsCovered.toString(), icon: BookOpen, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Avg. Time Saved', value: totalLessons > 0 ? '45min' : '0min', icon: TrendingUp, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50' },
  ];

  // Calculate subject coverage
  const subjectCoverage = subjects.map(subject => ({
    subject,
    count: lessonPlans.filter(plan => plan.subject === subject).length
  }));

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-white shadow-xl transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-6 bg-gradient-to-br from-green-600 to-green-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CBC Planner</h1>
              <div className="flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-green-200" />
                <p className="text-xs text-green-100 font-medium">AI-Powered</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
              activeView === 'dashboard' 
                ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">Dashboard</span>
            {activeView === 'dashboard' && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>

          <button
            onClick={() => setActiveView('create')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
              activeView === 'create' 
                ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">New Lesson Plan</span>
            {activeView === 'create' && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>

          <button
            onClick={() => setActiveView('history')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
              activeView === 'history' 
                ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Past Lessons</span>
            {activeView === 'history' && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>

          <button
            onClick={() => setActiveView('resources')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
              activeView === 'resources' 
                ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="font-semibold">Resources</span>
            {activeView === 'resources' && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
              activeView === 'settings' 
                ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-semibold">Settings</span>
            {activeView === 'settings' && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>

          <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Teacher Name</p>
              <p className="text-xs text-gray-500">Primary School</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
              </button>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {activeView === 'dashboard' && 'Dashboard'}
                  {activeView === 'create' && 'Create New Lesson Plan'}
                  {activeView === 'history' && 'Past Lesson Plans'}
                  {activeView === 'resources' && 'Resources'}
                  {activeView === 'settings' && 'Settings'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">Welcome back! Ready to create amazing lessons?</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search lessons..."
                  className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-72 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeView === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">{stat.label}</p>
                        <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                        <stat.icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="relative bg-gradient-to-br from-green-600 via-green-600 to-green-700 rounded-2xl p-8 text-white shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-6 h-6 text-green-200" />
                    <span className="text-sm font-semibold text-green-100 uppercase tracking-wide">AI-Powered</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Ready to create your first lesson?</h3>
                  <p className="text-green-50 mb-6 text-lg">Generate CBC-aligned lesson plans in minutes with our intelligent assistant</p>
                  <button
                    onClick={() => setActiveView('create')}
                    className="bg-white text-green-700 px-8 py-3.5 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center gap-2 group"
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Create New Lesson Plan
                  </button>
                </div>
              </div>

              {/* Recent Lesson Plans */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900">Recent Lesson Plans</h3>
                </div>
                {lessonPlans.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md">
                      <FileText className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No lesson plans yet</h3>
                    <p className="text-gray-500 mb-6 text-lg">Create your first lesson plan to get started with CBC curriculum planning</p>
                    <button
                      onClick={() => setActiveView('create')}
                      className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-xl transition-all inline-flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Create Lesson Plan
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {lessonPlans.slice(0, 5).map((plan) => (
                      <div key={plan.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900 text-lg group-hover:text-green-600 transition-colors">{plan.topic}</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                plan.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {plan.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="font-medium">{plan.subject}</span>
                              <span>•</span>
                              <span>{plan.grade}</span>
                              <span>•</span>
                              <span>{plan.date}</span>
                            </div>
                          </div>
                          <button className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-1">
                            View
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subject Coverage */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Subject Coverage</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {subjectCoverage.map((item, index) => (
                    <div key={index} className="p-5 border-2 border-gray-100 rounded-xl hover:border-green-500 hover:shadow-md transition-all cursor-pointer group">
                      <p className="font-semibold text-gray-900 text-lg group-hover:text-green-600 transition-colors">{item.subject}</p>
                      <p className="text-sm text-gray-500 mt-2 font-medium">{item.count} {item.count === 1 ? 'lesson' : 'lessons'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeView === 'create' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10">
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">Create New Lesson Plan</h3>
                  <p className="text-gray-600 text-lg">Fill in the details and let AI generate a CBC-aligned lesson plan for you</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                      <select 
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 focus:bg-white"
                      >
                        <option value="">Select subject</option>
                        {subjects.map((subject, index) => (
                          <option key={index} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
                      <select 
                        value={formData.grade}
                        onChange={(e) => handleInputChange('grade', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 focus:bg-white"
                      >
                        <option value="">Select grade</option>
                        <option value="1">Grade 1</option>
                        <option value="2">Grade 2</option>
                        <option value="3">Grade 3</option>
                        <option value="4">Grade 4</option>
                        <option value="5">Grade 5</option>
                        <option value="6">Grade 6</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Topic/Learning Area</label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => handleInputChange('topic', e.target.value)}
                      placeholder="e.g., Introduction to Fractions"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="40"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Objectives</label>
                    <textarea
                      rows="5"
                      value={formData.objectives}
                      onChange={(e) => handleInputChange('objectives', e.target.value)}
                      placeholder="What should learners be able to do by the end of this lesson?"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gray-50 focus:bg-white resize-none"
                    ></textarea>
                  </div>

                  <button
                    onClick={handleGeneratePlan}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate Lesson Plan with AI
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeView === 'history' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">All Lesson Plans</h3>
                <div className="flex gap-3">
                  <select className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 font-medium">
                    <option>All Subjects</option>
                    {subjects.map((subject, index) => (
                      <option key={index}>{subject}</option>
                    ))}
                  </select>
                  <select className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 font-medium">
                    <option>All Grades</option>
                    <option>Grade 1</option>
                    <option>Grade 2</option>
                    <option>Grade 3</option>
                    <option>Grade 4</option>
                    <option>Grade 5</option>
                    <option>Grade 6</option>
                  </select>
                </div>
              </div>
              {lessonPlans.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md">
                    <Clock className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No lesson plans yet</h3>
                  <p className="text-gray-500 mb-6 text-lg">Your past lesson plans will appear here once you create them</p>
                  <button
                    onClick={() => setActiveView('create')}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-xl transition-all inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Plan
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {lessonPlans.map((plan) => (
                    <div key={plan.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900 text-lg group-hover:text-green-600 transition-colors">{plan.topic}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              plan.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {plan.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="font-medium">{plan.subject}</span>
                            <span>•</span>
                            <span>{plan.grade}</span>
                            <span>•</span>
                            <span>{plan.date}</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button className="text-green-600 hover:text-green-700 font-semibold px-4 py-2 hover:bg-green-50 rounded-lg transition-all">Edit</button>
                          <button className="text-gray-600 hover:text-gray-700 font-semibold px-4 py-2 hover:bg-gray-100 rounded-lg transition-all">Duplicate</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}