import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { profileAPI, insightsAPI, graphAPI } from '../lib/api';
import { useProfileStore } from '../store/profileStore';
import { useAuthStore } from '../store/authStore';
import { BookOpen, TrendingUp, Target, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const { profile, setProfile } = useProfileStore();
  const [insights, setInsights] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, insightsRes, recsRes] = await Promise.all([
        profileAPI.getMe(),
        insightsAPI.getMe().catch(() => ({ data: null })),
        graphAPI.getRecommendations().catch(() => ({ data: { recommendations: [] } })),
      ]);

      setProfile(profileRes.data);
      setInsights(insightsRes.data?.insights);
      setRecommendations(recsRes.data.recommendations);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 mt-1">
                Level: {profile?.experience_level || 'Beginner'} • 
                {profile?.submissions_count || 0} problems solved
              </p>
            </div>
            <Link to="/problems" className="btn btn-primary">
              <BookOpen className="w-5 h-5 mr-2 inline" />
              Browse Problems
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Target className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Submissions</p>
                <p className="text-2xl font-bold">{profile?.submissions_count || 0}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Strengths</p>
                <p className="text-2xl font-bold">{profile?.strengths?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Concepts to Learn</p>
                <p className="text-2xl font-bold">{profile?.gaps?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Recommendations */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Recommended for You</h2>
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 bg-primary-50 rounded-lg border border-primary-200"
                  >
                    <h3 className="font-semibold text-primary-900">{rec.name}</h3>
                    <p className="text-sm text-primary-700 mt-1">
                      Tier {rec.tier} • Difficulty: {rec.difficulty}/5
                    </p>
                  </div>
                ))}
                <Link
                  to="/knowledge-graph"
                  className="block text-center text-primary-600 hover:underline mt-4"
                >
                  View Knowledge Graph →
                </Link>
              </div>
            ) : (
              <p className="text-gray-600">
                Complete some problems to get personalized recommendations!
              </p>
            )}
          </div>

          {/* Insights */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Learning Insights</h2>
            {insights ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Summary</p>
                  <p className="text-gray-600 mt-1">{insights.summary}</p>
                </div>

                {insights.improving_concepts?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-green-700">Improving</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {insights.improving_concepts.map((c: string) => (
                        <span
                          key={c}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {insights.recommended_focus?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-primary-700">Focus On</p>
                    <ul className="list-disc list-inside text-gray-600 mt-1">
                      {insights.recommended_focus.map((c: string) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {insights.motivational_note && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">{insights.motivational_note}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">
                Solve 5 problems to unlock AI-powered insights about your learning journey!
              </p>
            )}
          </div>
        </div>

        {/* Skills Overview */}
        {profile?.skills && Object.keys(profile.skills).length > 0 && (
          <div className="card mt-6">
            <h2 className="text-xl font-bold mb-4">Your Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(profile.skills)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 9)
                .map(([concept, level]) => (
                  <div key={concept} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{concept}</span>
                      <span className="text-gray-600">{Math.round((level as number) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (level as number) >= 0.7
                            ? 'bg-green-500'
                            : (level as number) >= 0.4
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${(level as number) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
