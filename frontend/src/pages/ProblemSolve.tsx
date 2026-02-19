import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { problemsAPI, reviewAPI, tutorAPI } from '../lib/api';
import { getDifficultyColor, getDifficultyLabel } from '../lib/utils';
import { Send, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
}

export default function ProblemSolve() {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('');
  const [language] = useState('python');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState<any>(null);
  
  // Tutor state
  const [showTutor, setShowTutor] = useState(false);
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorResponse, setTutorResponse] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const [hint, setHint] = useState('');

  useEffect(() => {
    if (id) loadProblem();
  }, [id]);

  const loadProblem = async () => {
    try {
      const { data } = await problemsAPI.getById(id!);
      setProblem(data);
      setCode(`# ${data.title}\n# Write your solution here\n\ndef solution():\n    pass\n`);
    } catch (error) {
      toast.error('Failed to load problem');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setSubmitting(true);
    setReview(null);

    try {
      const { data } = await reviewAPI.submit({
        problem_id: id!,
        code,
        language,
      });
      setReview(data);
      toast.success('Code reviewed!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAskTutor = async () => {
    if (!tutorQuestion.trim()) {
      toast.error('Please ask a question');
      return;
    }

    setTutorLoading(true);
    setTutorResponse('');

    try {
      const { data } = await tutorAPI.ask({
        problem_id: id!,
        question: tutorQuestion,
      });
      setTutorResponse(data.response);
      setTutorQuestion('');
    } catch (error) {
      toast.error('Failed to get tutor response');
    } finally {
      setTutorLoading(false);
    }
  };

  const handleGetHint = async () => {
    setTutorLoading(true);
    try {
      const { data } = await tutorAPI.hint(id!);
      setHint(data.hint);
      setShowTutor(true);
      toast.success('Hint generated!');
    } catch (error) {
      toast.error('Failed to get hint');
    } finally {
      setTutorLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Problem not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                    problem.difficulty
                  )}`}
                >
                  {getDifficultyLabel(problem.difficulty)}
                </span>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{problem.description}</p>

                {problem.examples && problem.examples.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Examples</h3>
                    {problem.examples.map((ex, i) => (
                      <div key={i} className="bg-gray-50 p-4 rounded-lg mb-3">
                        <p className="text-sm">
                          <span className="font-medium">Input:</span> {ex.input}
                        </p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">Output:</span> {ex.output}
                        </p>
                        {ex.explanation && (
                          <p className="text-sm text-gray-600 mt-1">{ex.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {problem.constraints && problem.constraints.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Constraints</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {problem.constraints.map((c, i) => (
                        <li key={i} className="text-sm text-gray-700">
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Review Results */}
            {review && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                  Review Results
                </h2>

                <div className="space-y-4">
                  {review.strengths && review.strengths.length > 0 && (
                    <div>
                      <p className="font-medium text-green-700 mb-2">Strengths</p>
                      <ul className="list-disc list-inside space-y-1">
                        {review.strengths.map((s: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700">{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {review.weaknesses && review.weaknesses.length > 0 && (
                    <div>
                      <p className="font-medium text-red-700 mb-2">Areas to Improve</p>
                      <ul className="list-disc list-inside space-y-1">
                        {review.weaknesses.map((w: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700">{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {review.detailed_feedback && (
                    <div className="p-4 bg-primary-50 rounded-lg">
                      <p className="text-sm text-gray-800 whitespace-pre-line">
                        {review.detailed_feedback}
                      </p>
                    </div>
                  )}

                  {review.topics_to_revise && review.topics_to_revise.length > 0 && (
                    <div>
                      <p className="font-medium text-yellow-700 mb-2">Topics to Revise</p>
                      <div className="flex flex-wrap gap-2">
                        {review.topics_to_revise.map((t: string) => (
                          <span
                            key={t}
                            className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Code Editor & Tutor */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Your Solution</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleGetHint}
                    disabled={tutorLoading}
                    className="btn btn-outline text-sm"
                  >
                    <Lightbulb className="w-4 h-4 mr-1" />
                    Hint
                  </button>
                  <button
                    onClick={() => setShowTutor(!showTutor)}
                    className="btn btn-secondary text-sm"
                  >
                    Ask AI Tutor
                  </button>
                </div>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="input font-mono text-sm min-h-[400px] resize-none"
                placeholder="Write your code here..."
              />

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn btn-primary w-full mt-4"
              >
                {submitting ? 'Submitting...' : 'Submit Solution'}
              </button>
            </div>

            {/* Tutor Panel */}
            {showTutor && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4">AI Tutor</h2>

                {hint && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Hint:</p>
                    <p className="text-sm text-gray-800">{hint}</p>
                  </div>
                )}

                {tutorResponse && (
                  <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg mb-4">
                    <p className="text-sm text-gray-800 whitespace-pre-line">{tutorResponse}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tutorQuestion}
                    onChange={(e) => setTutorQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAskTutor()}
                    placeholder="Ask a question..."
                    className="input flex-1"
                  />
                  <button
                    onClick={handleAskTutor}
                    disabled={tutorLoading}
                    className="btn btn-primary"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
