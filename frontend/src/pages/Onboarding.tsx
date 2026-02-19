import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../lib/api';
import { useProfileStore } from '../store/profileStore';
import toast from 'react-hot-toast';

export default function Onboarding() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const setProfile = useProfileStore((state) => state.setProfile);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const { data } = await profileAPI.getOnboardingQuestions();
      setQuestions(data.questions);
      const initialAnswers: Record<string, string> = {};
      data.questions.forEach((_: string, i: number) => {
        initialAnswers[`q${i + 1}`] = '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      toast.error('Failed to load questions');
    }
  };

  const handleNext = () => {
    if (!answers[`q${currentStep + 1}`].trim()) {
      toast.error('Please answer the question');
      return;
    }
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!answers[`q${currentStep + 1}`].trim()) {
      toast.error('Please answer the question');
      return;
    }

    setLoading(true);
    try {
      const { data } = await profileAPI.submitOnboarding(answers);
      setProfile(data.profile);
      toast.success('Profile created! Let\'s start learning.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700">Let's Get to Know You</h1>
          <p className="text-gray-600 mt-2">
            Answer a few questions to personalize your learning experience
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentStep + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {questions[currentStep]}
          </h2>

          <textarea
            value={answers[`q${currentStep + 1}`]}
            onChange={(e) =>
              setAnswers({ ...answers, [`q${currentStep + 1}`]: e.target.value })
            }
            className="input min-h-[120px] resize-none"
            placeholder="Type your answer here..."
          />

          <div className="flex justify-between mt-6">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="btn btn-secondary"
            >
              Back
            </button>

            {currentStep < questions.length - 1 ? (
              <button onClick={handleNext} className="btn btn-primary">
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Submitting...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
