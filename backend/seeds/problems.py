"""
50 DSA Problems seed — linked to concept IDs from concepts.py
Each problem has: id, title, description, examples, constraints, difficulty (1-5), concept_ids
"""

PROBLEMS = [
    # ── Arrays (c02) ─────────────────────────────────────────────────────────
    {
        "id": "p001", "difficulty": 1, "concept_ids": ["c02"],
        "title": "Two Sum",
        "description": "Given an array of integers `nums` and a target integer `target`, return the indices of the two numbers such that they add up to `target`. You may not use the same element twice.",
        "examples": [
            {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "nums[0] + nums[1] = 2 + 7 = 9"},
            {"input": "nums = [3,2,4], target = 6", "output": "[1,2]"},
        ],
        "constraints": ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists."],
    },
    {
        "id": "p002", "difficulty": 1, "concept_ids": ["c02"],
        "title": "Best Time to Buy and Sell Stock",
        "description": "Given an array `prices` where `prices[i]` is the price of a stock on day `i`, return the maximum profit you can achieve. You may only buy once and sell once.",
        "examples": [
            {"input": "prices = [7,1,5,3,6,4]", "output": "5", "explanation": "Buy on day 2 (price=1), sell on day 5 (price=6)."},
            {"input": "prices = [7,6,4,3,1]", "output": "0", "explanation": "No profit possible."},
        ],
        "constraints": ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    },
    {
        "id": "p003", "difficulty": 2, "concept_ids": ["c02"],
        "title": "Product of Array Except Self",
        "description": "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all elements of `nums` except `nums[i]`. Solve without division and in O(n).",
        "examples": [
            {"input": "nums = [1,2,3,4]", "output": "[24,12,8,6]"},
            {"input": "nums = [-1,1,0,-3,3]", "output": "[0,0,9,0,0]"},
        ],
        "constraints": ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30"],
    },
    {
        "id": "p004", "difficulty": 2, "concept_ids": ["c02"],
        "title": "Container With Most Water",
        "description": "Given `n` vertical lines at positions `i`, with height `height[i]`, find two lines that together with the x-axis form a container with the most water.",
        "examples": [
            {"input": "height = [1,8,6,2,5,4,8,3,7]", "output": "49"},
        ],
        "constraints": ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
    },

    # ── Strings (c03) ────────────────────────────────────────────────────────
    {
        "id": "p005", "difficulty": 1, "concept_ids": ["c03"],
        "title": "Valid Anagram",
        "description": "Given two strings `s` and `t`, return true if `t` is an anagram of `s`, and false otherwise.",
        "examples": [
            {"input": "s = 'anagram', t = 'nagaram'", "output": "true"},
            {"input": "s = 'rat', t = 'car'", "output": "false"},
        ],
        "constraints": ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters."],
    },
    {
        "id": "p006", "difficulty": 2, "concept_ids": ["c03"],
        "title": "Longest Palindromic Substring",
        "description": "Given a string `s`, return the longest palindromic substring in `s`.",
        "examples": [
            {"input": "s = 'babad'", "output": "'bab'"},
            {"input": "s = 'cbbd'", "output": "'bb'"},
        ],
        "constraints": ["1 <= s.length <= 1000", "s consists of digits and English letters."],
    },
    {
        "id": "p007", "difficulty": 2, "concept_ids": ["c03", "c09"],
        "title": "Group Anagrams",
        "description": "Given an array of strings `strs`, group the anagrams together. Return the groups in any order.",
        "examples": [
            {"input": "strs = ['eat','tea','tan','ate','nat','bat']", "output": "[['bat'],['nat','tan'],['ate','eat','tea']]"},
        ],
        "constraints": ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100"],
    },

    # ── Hash Maps (c09) ───────────────────────────────────────────────────────
    {
        "id": "p008", "difficulty": 1, "concept_ids": ["c09"],
        "title": "Contains Duplicate",
        "description": "Given an integer array `nums`, return true if any value appears at least twice, false if all elements are distinct.",
        "examples": [
            {"input": "nums = [1,2,3,1]", "output": "true"},
            {"input": "nums = [1,2,3,4]", "output": "false"},
        ],
        "constraints": ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    },
    {
        "id": "p009", "difficulty": 2, "concept_ids": ["c09"],
        "title": "Top K Frequent Elements",
        "description": "Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. Return the answer in any order.",
        "examples": [
            {"input": "nums = [1,1,1,2,2,3], k = 2", "output": "[1,2]"},
        ],
        "constraints": ["1 <= nums.length <= 10^5", "k is in range [1, number of unique elements]"],
    },

    # ── Two Pointers (c18) ────────────────────────────────────────────────────
    {
        "id": "p010", "difficulty": 1, "concept_ids": ["c18", "c02"],
        "title": "Valid Palindrome",
        "description": "A phrase is a palindrome if it reads the same forwards and backwards (ignoring case and non-alphanumeric characters). Given a string `s`, return true if it is a palindrome, false otherwise.",
        "examples": [
            {"input": "s = 'A man, a plan, a canal: Panama'", "output": "true"},
            {"input": "s = 'race a car'", "output": "false"},
        ],
        "constraints": ["1 <= s.length <= 2 * 10^5"],
    },
    {
        "id": "p011", "difficulty": 2, "concept_ids": ["c18", "c02"],
        "title": "Three Sum",
        "description": "Given an integer array nums, return all triplets [nums[i], nums[j], nums[k]] such that i != j != k and nums[i] + nums[j] + nums[k] == 0. No duplicate triplets.",
        "examples": [
            {"input": "nums = [-1,0,1,2,-1,-4]", "output": "[[-1,-1,2],[-1,0,1]]"},
        ],
        "constraints": ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
    },

    # ── Sliding Window (c19) ─────────────────────────────────────────────────
    {
        "id": "p012", "difficulty": 2, "concept_ids": ["c19", "c09"],
        "title": "Longest Substring Without Repeating Characters",
        "description": "Given a string `s`, find the length of the longest substring without repeating characters.",
        "examples": [
            {"input": "s = 'abcabcbb'", "output": "3", "explanation": "'abc' is the answer."},
            {"input": "s = 'bbbbb'", "output": "1"},
        ],
        "constraints": ["0 <= s.length <= 5 * 10^4"],
    },
    {
        "id": "p013", "difficulty": 3, "concept_ids": ["c19", "c09"],
        "title": "Minimum Window Substring",
        "description": "Given strings `s` and `t`, return the minimum window substring of `s` such that every character in `t` is included in the window. Return empty string if no such window exists.",
        "examples": [
            {"input": "s = 'ADOBECODEBANC', t = 'ABC'", "output": "'BANC'"},
        ],
        "constraints": ["1 <= s.length, t.length <= 10^5"],
    },

    # ── Binary Search (c17) ──────────────────────────────────────────────────
    {
        "id": "p014", "difficulty": 1, "concept_ids": ["c17"],
        "title": "Binary Search",
        "description": "Given a sorted array of integers `nums` and a target `target`, return the index of `target` or -1 if not found. Must run in O(log n).",
        "examples": [
            {"input": "nums = [-1,0,3,5,9,12], target = 9", "output": "4"},
            {"input": "nums = [-1,0,3,5,9,12], target = 2", "output": "-1"},
        ],
        "constraints": ["1 <= nums.length <= 10^4", "All values in nums are unique and sorted ascending."],
    },
    {
        "id": "p015", "difficulty": 3, "concept_ids": ["c17"],
        "title": "Search in Rotated Sorted Array",
        "description": "A sorted array is rotated at some pivot. Given this array `nums` and a `target`, return its index or -1. Must run in O(log n).",
        "examples": [
            {"input": "nums = [4,5,6,7,0,1,2], target = 0", "output": "4"},
            {"input": "nums = [4,5,6,7,0,1,2], target = 3", "output": "-1"},
        ],
        "constraints": ["1 <= nums.length <= 5000", "All values unique"],
    },
    {
        "id": "p016", "difficulty": 3, "concept_ids": ["c17"],
        "title": "Find Minimum in Rotated Sorted Array",
        "description": "Given a sorted rotated array `nums` of unique elements, return the minimum element. Must run in O(log n).",
        "examples": [
            {"input": "nums = [3,4,5,1,2]", "output": "1"},
            {"input": "nums = [4,5,6,7,0,1,2]", "output": "0"},
        ],
        "constraints": ["1 <= nums.length <= 5000"],
    },

    # ── Stacks (c07) ─────────────────────────────────────────────────────────
    {
        "id": "p017", "difficulty": 1, "concept_ids": ["c07"],
        "title": "Valid Parentheses",
        "description": "Given a string `s` containing only '(', ')', '{', '}', '[' and ']', determine if the input string is valid (brackets closed in correct order).",
        "examples": [
            {"input": "s = '()[]{}'", "output": "true"},
            {"input": "s = '(]'", "output": "false"},
        ],
        "constraints": ["1 <= s.length <= 10^4"],
    },
    {
        "id": "p018", "difficulty": 3, "concept_ids": ["c07"],
        "title": "Daily Temperatures",
        "description": "Given an array `temperatures`, return an array `answer` where `answer[i]` is the number of days until a warmer temperature. If no future warmer temperature, `answer[i] = 0`.",
        "examples": [
            {"input": "temperatures = [73,74,75,71,69,72,76,73]", "output": "[1,1,4,2,1,1,0,0]"},
        ],
        "constraints": ["1 <= temperatures.length <= 10^5"],
    },

    # ── Recursion (c10) ──────────────────────────────────────────────────────
    {
        "id": "p019", "difficulty": 2, "concept_ids": ["c10"],
        "title": "Fibonacci Number",
        "description": "Given an integer `n`, return the nth Fibonacci number. F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2).",
        "examples": [
            {"input": "n = 4", "output": "3"},
            {"input": "n = 10", "output": "55"},
        ],
        "constraints": ["0 <= n <= 30"],
    },
    {
        "id": "p020", "difficulty": 2, "concept_ids": ["c10"],
        "title": "Power of Two",
        "description": "Given an integer `n`, return true if it is a power of two, false otherwise. Solve using recursion.",
        "examples": [
            {"input": "n = 1", "output": "true"},
            {"input": "n = 16", "output": "true"},
            {"input": "n = 3", "output": "false"},
        ],
        "constraints": ["-2^31 <= n <= 2^31 - 1"],
    },

    # ── Linked Lists (c06) ───────────────────────────────────────────────────
    {
        "id": "p021", "difficulty": 2, "concept_ids": ["c06"],
        "title": "Reverse Linked List",
        "description": "Given the head of a singly linked list, reverse the list and return the reversed list.",
        "examples": [
            {"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]"},
            {"input": "head = [1,2]", "output": "[2,1]"},
        ],
        "constraints": ["The number of nodes is in range [0, 5000]."],
    },
    {
        "id": "p022", "difficulty": 2, "concept_ids": ["c06", "c18"],
        "title": "Linked List Cycle",
        "description": "Given the head of a linked list, determine if the linked list has a cycle. Use Floyd's slow/fast pointer technique.",
        "examples": [
            {"input": "head = [3,2,0,-4], pos = 1", "output": "true"},
            {"input": "head = [1,2], pos = -1", "output": "false"},
        ],
        "constraints": ["Number of nodes 0 to 10^4"],
    },
    {
        "id": "p023", "difficulty": 3, "concept_ids": ["c06"],
        "title": "Merge Two Sorted Lists",
        "description": "You are given the heads of two sorted linked lists. Merge the two lists into one sorted list and return the head.",
        "examples": [
            {"input": "list1 = [1,2,4], list2 = [1,3,4]", "output": "[1,1,2,3,4,4]"},
        ],
        "constraints": ["0 <= each list length <= 50", "-100 <= Node.val <= 100"],
    },

    # ── Binary Trees (c11) ───────────────────────────────────────────────────
    {
        "id": "p024", "difficulty": 2, "concept_ids": ["c11", "c10"],
        "title": "Maximum Depth of Binary Tree",
        "description": "Given the root of a binary tree, return its maximum depth (number of nodes along the longest path from root to leaf).",
        "examples": [
            {"input": "root = [3,9,20,null,null,15,7]", "output": "3"},
        ],
        "constraints": ["0 <= number of nodes <= 10^4"],
    },
    {
        "id": "p025", "difficulty": 2, "concept_ids": ["c11", "c10"],
        "title": "Invert Binary Tree",
        "description": "Given the root of a binary tree, invert the tree (mirror image) and return its root.",
        "examples": [
            {"input": "root = [4,2,7,1,3,6,9]", "output": "[4,7,2,9,6,3,1]"},
        ],
        "constraints": ["0 <= number of nodes <= 100"],
    },
    {
        "id": "p026", "difficulty": 3, "concept_ids": ["c11", "c08"],
        "title": "Binary Tree Level Order Traversal",
        "description": "Given the root of a binary tree, return the level order traversal of its nodes' values (left to right, level by level).",
        "examples": [
            {"input": "root = [3,9,20,null,null,15,7]", "output": "[[3],[9,20],[15,7]]"},
        ],
        "constraints": ["0 <= number of nodes <= 2000"],
    },
    {
        "id": "p027", "difficulty": 3, "concept_ids": ["c11"],
        "title": "Diameter of Binary Tree",
        "description": "Given the root of a binary tree, return the length of the diameter (the longest path between any two nodes, which may or may not pass through the root).",
        "examples": [
            {"input": "root = [1,2,3,4,5]", "output": "3", "explanation": "The path 4->2->1->3 or 5->2->1->3."},
        ],
        "constraints": ["1 <= number of nodes <= 10^4"],
    },

    # ── BST (c12) ────────────────────────────────────────────────────────────
    {
        "id": "p028", "difficulty": 2, "concept_ids": ["c12"],
        "title": "Validate Binary Search Tree",
        "description": "Given the root of a binary tree, determine if it is a valid BST (left subtree values < node, right subtree values > node, recursively).",
        "examples": [
            {"input": "root = [2,1,3]", "output": "true"},
            {"input": "root = [5,1,4,null,null,3,6]", "output": "false"},
        ],
        "constraints": ["-2^31 <= Node.val <= 2^31 - 1"],
    },

    # ── Heaps (c13) ──────────────────────────────────────────────────────────
    {
        "id": "p029", "difficulty": 3, "concept_ids": ["c13"],
        "title": "Kth Largest Element in an Array",
        "description": "Given an integer array `nums` and an integer `k`, return the kth largest element in the array (not kth distinct element).",
        "examples": [
            {"input": "nums = [3,2,1,5,6,4], k = 2", "output": "5"},
        ],
        "constraints": ["1 <= k <= nums.length <= 10^5"],
    },
    {
        "id": "p030", "difficulty": 4, "concept_ids": ["c13"],
        "title": "Find Median from Data Stream",
        "description": "Implement a MedianFinder class with `addNum(int num)` and `findMedian()`. Both operations should be efficient using two heaps.",
        "examples": [
            {"input": "addNum(1), addNum(2), findMedian(), addNum(3), findMedian()", "output": "1.5, 2.0"},
        ],
        "constraints": ["-10^5 <= num <= 10^5", "findMedian is called after at least one addNum"],
    },

    # ── Graphs (c14, BFS c25, DFS c26) ───────────────────────────────────────
    {
        "id": "p031", "difficulty": 3, "concept_ids": ["c14", "c25"],
        "title": "Number of Islands",
        "description": "Given an m x n grid of '1's (land) and '0's (water), count the number of islands. An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.",
        "examples": [
            {"input": "grid = [['1','1','0','0'],['0','1','0','0'],['0','0','1','1']]", "output": "2"},
        ],
        "constraints": ["1 <= m, n <= 300"],
    },
    {
        "id": "p032", "difficulty": 3, "concept_ids": ["c14", "c25"],
        "title": "Clone Graph",
        "description": "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.",
        "examples": [
            {"input": "adjList = [[2,4],[1,3],[2,4],[1,3]]", "output": "[[2,4],[1,3],[2,4],[1,3]]"},
        ],
        "constraints": ["The graph is connected", "1 <= Node.val <= 100", "No repeated edges or self-loops"],
    },
    {
        "id": "p033", "difficulty": 4, "concept_ids": ["c14", "c26", "c09"],
        "title": "Pacific Atlantic Water Flow",
        "description": "An m x n matrix of heights. Water can flow from a cell to a neighbor with equal or lesser height. Find all cells that can flow to both Pacific (top/left edge) and Atlantic (bottom/right edge) ocean.",
        "examples": [
            {"input": "heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]", "output": "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]"},
        ],
        "constraints": ["1 <= m, n <= 200"],
    },

    # ── Dynamic Programming (c22) ────────────────────────────────────────────
    {
        "id": "p034", "difficulty": 2, "concept_ids": ["c22", "c10"],
        "title": "Climbing Stairs",
        "description": "You are climbing `n` stairs. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        "examples": [
            {"input": "n = 2", "output": "2", "explanation": "1+1, 2"},
            {"input": "n = 3", "output": "3", "explanation": "1+1+1, 1+2, 2+1"},
        ],
        "constraints": ["1 <= n <= 45"],
    },
    {
        "id": "p035", "difficulty": 3, "concept_ids": ["c22"],
        "title": "Coin Change",
        "description": "Given an array `coins` of coin denominations and an integer `amount`, return the fewest number of coins needed to make up `amount`. Return -1 if it cannot be done.",
        "examples": [
            {"input": "coins = [1,5,11], amount = 11", "output": "1"},
            {"input": "coins = [2], amount = 3", "output": "-1"},
        ],
        "constraints": ["1 <= coins.length <= 12", "0 <= amount <= 10^4"],
    },
    {
        "id": "p036", "difficulty": 3, "concept_ids": ["c22"],
        "title": "Longest Increasing Subsequence",
        "description": "Given an integer array `nums`, return the length of the longest strictly increasing subsequence.",
        "examples": [
            {"input": "nums = [10,9,2,5,3,7,101,18]", "output": "4", "explanation": "[2,3,7,101]"},
        ],
        "constraints": ["1 <= nums.length <= 2500"],
    },
    {
        "id": "p037", "difficulty": 4, "concept_ids": ["c22"],
        "title": "Longest Common Subsequence",
        "description": "Given two strings `text1` and `text2`, return the length of their longest common subsequence. A subsequence is a sequence derived by deleting some characters without changing relative order.",
        "examples": [
            {"input": "text1 = 'abcde', text2 = 'ace'", "output": "3"},
        ],
        "constraints": ["1 <= text1.length, text2.length <= 1000"],
    },
    {
        "id": "p038", "difficulty": 4, "concept_ids": ["c22"],
        "title": "0/1 Knapsack Problem",
        "description": "Given `n` items with weights and values, and a knapsack of capacity `W`, find the maximum value you can carry (each item can only be used once).",
        "examples": [
            {"input": "weights=[1,2,3], values=[6,10,12], W=5", "output": "22"},
        ],
        "constraints": ["1 <= n <= 100", "1 <= W <= 1000"],
    },

    # ── Backtracking (c24) ────────────────────────────────────────────────────
    {
        "id": "p039", "difficulty": 3, "concept_ids": ["c24", "c10"],
        "title": "Subsets",
        "description": "Given an integer array `nums` of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.",
        "examples": [
            {"input": "nums = [1,2,3]", "output": "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]"},
        ],
        "constraints": ["1 <= nums.length <= 10"],
    },
    {
        "id": "p040", "difficulty": 3, "concept_ids": ["c24", "c10"],
        "title": "Combination Sum",
        "description": "Given an array `candidates` and a `target`, find all unique combinations of candidates that sum to target. The same number may be chosen unlimited times.",
        "examples": [
            {"input": "candidates = [2,3,6,7], target = 7", "output": "[[2,2,3],[7]]"},
        ],
        "constraints": ["1 <= candidates.length <= 30", "1 <= target <= 500"],
    },
    {
        "id": "p041", "difficulty": 4, "concept_ids": ["c24", "c10"],
        "title": "N-Queens",
        "description": "Place `n` queens on an n×n chessboard such that no two queens attack each other. Return all distinct solutions.",
        "examples": [
            {"input": "n = 4", "output": "['.Q..','...Q','Q...','..Q.'],['..Q.','Q...','...Q','.Q..']"},
        ],
        "constraints": ["1 <= n <= 9"],
    },

    # ── Topological Sort (c27) ─────────────────────────────────────────────
    {
        "id": "p042", "difficulty": 4, "concept_ids": ["c27", "c14"],
        "title": "Course Schedule",
        "description": "There are `numCourses` courses (0 to n-1). Given `prerequisites` where [a,b] means you must take b before a, determine if you can finish all courses.",
        "examples": [
            {"input": "numCourses = 2, prerequisites = [[1,0]]", "output": "true"},
            {"input": "numCourses = 2, prerequisites = [[1,0],[0,1]]", "output": "false"},
        ],
        "constraints": ["1 <= numCourses <= 2000"],
    },
    {
        "id": "p043", "difficulty": 4, "concept_ids": ["c27", "c14"],
        "title": "Course Schedule II",
        "description": "Return the ordering of courses to finish all courses, or an empty array if impossible.",
        "examples": [
            {"input": "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]", "output": "[0,2,1,3]"},
        ],
        "constraints": ["1 <= numCourses <= 2000"],
    },

    # ── Union Find (c28) ─────────────────────────────────────────────────────
    {
        "id": "p044", "difficulty": 4, "concept_ids": ["c28", "c14"],
        "title": "Number of Connected Components in Undirected Graph",
        "description": "Given `n` nodes (0 to n-1) and a list of `edges`, return the number of connected components using Union Find.",
        "examples": [
            {"input": "n = 5, edges = [[0,1],[1,2],[3,4]]", "output": "2"},
        ],
        "constraints": ["1 <= n <= 2000"],
    },
    {
        "id": "p045", "difficulty": 4, "concept_ids": ["c28", "c14"],
        "title": "Redundant Connection",
        "description": "In a graph with n nodes and n edges, one edge creates a cycle. Return that edge. Use Union Find.",
        "examples": [
            {"input": "edges = [[1,2],[1,3],[2,3]]", "output": "[2,3]"},
        ],
        "constraints": ["n == edges.length", "3 <= n <= 1000"],
    },

    # ── Shortest Path (c29) ──────────────────────────────────────────────────
    {
        "id": "p046", "difficulty": 4, "concept_ids": ["c29", "c13", "c14"],
        "title": "Network Delay Time",
        "description": "Given a network of `n` nodes and weighted directed edges `times[i] = (u, v, w)`, find the minimum time for signal from node `k` to reach all nodes. Return -1 if impossible (Dijkstra).",
        "examples": [
            {"input": "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2", "output": "2"},
        ],
        "constraints": ["1 <= k <= n <= 100"],
    },

    # ── Prefix Sums (c20) ─────────────────────────────────────────────────────
    {
        "id": "p047", "difficulty": 2, "concept_ids": ["c20", "c09"],
        "title": "Subarray Sum Equals K",
        "description": "Given an array `nums` and an integer `k`, return the total number of subarrays whose sum equals `k`.",
        "examples": [
            {"input": "nums = [1,1,1], k = 2", "output": "2"},
        ],
        "constraints": ["1 <= nums.length <= 2 * 10^4", "-1000 <= nums[i] <= 1000"],
    },

    # ── Tries (c15) ─────────────────────────────────────────────────────────
    {
        "id": "p048", "difficulty": 3, "concept_ids": ["c15"],
        "title": "Implement Trie (Prefix Tree)",
        "description": "Implement a Trie class with `insert(word)`, `search(word)`, and `startsWith(prefix)` methods.",
        "examples": [
            {"input": "insert('apple'), search('apple'), search('app'), startsWith('app'), insert('app'), search('app')", "output": "true, false, true, true"},
        ],
        "constraints": ["1 <= word.length, prefix.length <= 2000"],
    },

    # ── Greedy (c23) ─────────────────────────────────────────────────────────
    {
        "id": "p049", "difficulty": 3, "concept_ids": ["c23", "c16"],
        "title": "Jump Game",
        "description": "Given an integer array `nums` where `nums[i]` is the max jump length from that position, return true if you can reach the last index.",
        "examples": [
            {"input": "nums = [2,3,1,1,4]", "output": "true"},
            {"input": "nums = [3,2,1,0,4]", "output": "false"},
        ],
        "constraints": ["1 <= nums.length <= 3 * 10^4"],
    },

    # ── Divide & Conquer (c21) ────────────────────────────────────────────────
    {
        "id": "p050", "difficulty": 4, "concept_ids": ["c21", "c10"],
        "title": "Merge Sort Implementation",
        "description": "Implement merge sort to sort an integer array in ascending order. Your implementation must run in O(n log n) time.",
        "examples": [
            {"input": "nums = [38,27,43,3,9,82,10]", "output": "[3,9,10,27,38,43,82]"},
        ],
        "constraints": ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    },
]
