# Perspectra — Project Summary (with implementation hints)

- Perspectra is an agentic AI EdTech SaaS focused on improving students’ thinking and problem-solving ability, not rote memorization.
The core value is deep personalization through learning signals extracted from user attempts, especially for DSA and coding problems.

## plan and insructions
- lets sart with backend, test LLM response and then move to other parts like fronend , deployment.
- do one module at a time. ex: first only LOgin system
- after we succesfully finish onemodule lets move to diffrent one.
- i am doing this for my college hacakathon, for more context i will chat with you , plan crealy on winning product and potentially turn into a startup.
- if you have any doubt let me know.


## Problem statement:
**3C: Knowledge Graph Driven Adaptive Learning**
- Problem Context:Linear learning paths don't work — if you don't understand "fractions," you'll fail at "algebra." Current platforms don't understand concept dependencies and can't identify why students are struggling.

* What You Need to Build: Develop a learning system where concepts are connected through a knowledge graph and the learning path adapts automatically based on understanding gaps, reasoning patterns, and conceptual dependencies.

* Deliverables:
- Working knowledge graph for one subject (e.g., Math, Programming)
- Adaptive learning path generator based on diagnosed gaps
- Visualization showing student progress on the graph

## Core Philosophy our idea

* Questions are not the product → learning signal is

* Wrong answers are more valuable than correct ones

* The system continuously builds a cognitive profile of each learner

* Teaching adapts to thinking style, weaknesses, and progress over time

## User Flow (prefer this while creating TASK's)
1. Login 
2. We ask user about 4 to 5 On boarding questions , to initally let LLM have an idea about the user.
3. Dynamic Profile setup based on Onboarding.
4. students starts solving.
5. Now based on Dynamic Profile we trigger the Review or the Tutor.
6. get the feedbacks from them and update the Dynamic Pofile again.
7. This keeps repeating.
8. in backgrouond we summarise the users profile after certain intervals, like after he solved 5 questions, we see if he got better or worst.

## Core architecture:
1. Dynamic Profile

**Purpose: Maintain a dynamic learning profile for each user.**
- Data stored:
* Skill level per topic
* Strengths & weaknesses
* Common mistake patterns
* Preferred explanation style
* Progress trend
* hints (form tutor agent) - stores the hint given by Tutor agent
* all other form Reviewr agent (Go take for review output)
- Updates: Runs initially and is continuously updated via background jobs.

2. Reviewer Agent (MOST IMPORTANT)
**Purpose: Analyze user code submissions and extract learning signals.**
Input:
- Problem statement
- User code
- User profile data (for LLM context)

Output (structured JSON):
- Strengths
- Known Concepts
- Weaknesses
- Thinking style
- Concept gaps
- Topics to revise
- Detailed feedback from reviewr agent based on "Profile" (highly tailored)
- This output is stored and feeds all other agents.

3. Tutor Agent and Hint
**Purpose: Teach based on who the learner is, not generic explanations.**
- we have 2 buttons:
1. the "Ask AI" or "Tutor" - based on users question it give a tailored response again "Socratic based" and "The users profile".
2. The "Hint" - it is under tutor only but now instead of users input it looks at question, profile and give them a "HINT"

* Input (from dynamic profile again):
- User question
- User profile
- Recent weaknesses (last 5)
- Known Concepts 
- concept gaps 
- previous hints given by tutot (last 5)
* Output
- We store only the "Hints" in our profile
* Behavior:
- Adjusts depth, tone, and hints
- Encourages reasoning
- Avoids spoon-feeding answers
- its a socratic engine, we force user to think and arrive at the answer by questions not just direct spoon feeding


4. Background Agent (Async)

**Purpose: Long-term intelligence & memory.**
* Tasks - summarizing profile to produce insights about the user:
- Summarize multiple reviews
- Update profile trends
- Generate learning insights
- give details , on users data like, questions solved, weekness stregnts etc- basically all necessary details




