import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { problemsAPI } from '../lib/api';
import { getDifficultyColor, getDifficultyLabel } from '../lib/utils';
import { Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface Problem {
  id: string;
  title: string;
  difficulty: number;
  concept_ids: string[];
}

export default function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);

  useEffect(() => {
    loadProblems();
  }, []);

  useEffect(() => {
    filterProblems();
  }, [searchQuery, difficultyFilter, problems]);

  const loadProblems = async () => {
    try {
      const { data } = await problemsAPI.list();
      setProblems(data.problems);
      setFilteredProblems(data.problems);
    } catch (error) {
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  const filterProblems = () => {
    let filtered = problems;

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (difficultyFilter !== null) {
      filtered = filtered.filter((p) => p.difficulty === difficultyFilter);
    }

    setFilteredProblems(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Practice Problems</h1>
          <p className="text-gray-600 mt-1">
            {filteredProblems.length} problems available
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problems..."
                className="input pl-10"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDifficultyFilter(null)}
                className={`btn ${
                  difficultyFilter === null ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                All
              </button>
              {[1, 2, 3, 4, 5].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`btn ${
                    difficultyFilter === diff ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {getDifficultyLabel(diff)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="space-y-3">
          {filteredProblems.map((problem) => (
            <Link
              key={problem.id}
              to={`/problem/${problem.id}`}
              className="card hover:shadow-md transition-shadow block"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                    {problem.title}
                  </h3>
                  <div className="flex gap-2 mt-2">
                    {problem.concept_ids.slice(0, 3).map((cid) => (
                      <span
                        key={cid}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {cid}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="ml-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                      problem.difficulty
                    )}`}
                  >
                    {getDifficultyLabel(problem.difficulty)}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {filteredProblems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No problems found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
