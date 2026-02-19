"""
DSA Knowledge Graph — Concept nodes + dependency edges.
30 concepts across 5 tiers of DSA mastery.
"""

CONCEPTS = [
    # Tier 1 — Foundations
    {"id": "c01", "name": "Variables & Data Types",     "tier": 1, "difficulty": 1, "description": "Basic variable types: int, float, string, bool, and their operations."},
    {"id": "c02", "name": "Arrays",                     "tier": 1, "difficulty": 1, "description": "Static and dynamic arrays, indexing, iteration, and basic operations."},
    {"id": "c03", "name": "Strings",                    "tier": 1, "difficulty": 1, "description": "String manipulation, slicing, common string methods, and patterns."},
    {"id": "c04", "name": "Math & Modular Arithmetic",  "tier": 1, "difficulty": 2, "description": "GCD, LCM, prime checking, modular operations used in competitive programming."},
    {"id": "c05", "name": "Bit Manipulation",           "tier": 1, "difficulty": 3, "description": "AND, OR, XOR, shifts, bit tricks like checking power of 2, counting set bits."},

    # Tier 2 — Core Data Structures
    {"id": "c06", "name": "Linked Lists",               "tier": 2, "difficulty": 2, "description": "Singly and doubly linked lists, traversal, insertion, deletion, reversal."},
    {"id": "c07", "name": "Stacks",                     "tier": 2, "difficulty": 2, "description": "LIFO structure, implementation via array/list, valid parentheses, monotonic stack."},
    {"id": "c08", "name": "Queues",                     "tier": 2, "difficulty": 2, "description": "FIFO structure, deque, circular queue, sliding window maximum."},
    {"id": "c09", "name": "Hash Maps & Sets",           "tier": 2, "difficulty": 2, "description": "Key-value storage, O(1) lookup, frequency counting, grouping."},
    {"id": "c10", "name": "Recursion",                  "tier": 2, "difficulty": 3, "description": "Base case, recursive case, call stack visualization, classic problems."},

    # Tier 3 — Non-Linear Data Structures
    {"id": "c11", "name": "Binary Trees",               "tier": 3, "difficulty": 3, "description": "Tree terminology, traversals (inorder, preorder, postorder, level-order)."},
    {"id": "c12", "name": "Binary Search Trees",        "tier": 3, "difficulty": 3, "description": "BST property, insertion, deletion, search, validation, balancing."},
    {"id": "c13", "name": "Heaps & Priority Queues",    "tier": 3, "difficulty": 3, "description": "Min/max heap, heapify, heap sort, top-K problems."},
    {"id": "c14", "name": "Graphs",                     "tier": 3, "difficulty": 4, "description": "Representation (adjacency list/matrix), directed vs undirected, weighted."},
    {"id": "c15", "name": "Tries",                      "tier": 3, "difficulty": 4, "description": "Prefix tree, insert/search/startsWith, autocomplete, word dictionary."},

    # Tier 4 — Core Algorithms
    {"id": "c16", "name": "Sorting Algorithms",         "tier": 4, "difficulty": 2, "description": "Bubble, selection, insertion, merge sort, quicksort — complexity analysis."},
    {"id": "c17", "name": "Binary Search",              "tier": 4, "difficulty": 2, "description": "Search on sorted arrays, search space reduction, binary search on answer."},
    {"id": "c18", "name": "Two Pointers",               "tier": 4, "difficulty": 2, "description": "Left-right pointers, fast-slow pointers (Floyd's cycle), pair sum problems."},
    {"id": "c19", "name": "Sliding Window",             "tier": 4, "difficulty": 3, "description": "Fixed and variable window, maximum subarray variations, frequency maps in window."},
    {"id": "c20", "name": "Prefix Sums",                "tier": 4, "difficulty": 2, "description": "Cumulative sums, range queries, subarray sum equals K."},

    # Tier 5 — Advanced Algorithms
    {"id": "c21", "name": "Divide & Conquer",           "tier": 5, "difficulty": 4, "description": "Divide problem, solve subproblems, merge results — merge sort, closest pairs."},
    {"id": "c22", "name": "Dynamic Programming",        "tier": 5, "difficulty": 5, "description": "Memoization, tabulation, state definition, classic DP (knapsack, LCS, coins)."},
    {"id": "c23", "name": "Greedy Algorithms",          "tier": 5, "difficulty": 4, "description": "Local optimal → global optimal. Activity selection, interval scheduling, Huffman."},
    {"id": "c24", "name": "Backtracking",               "tier": 5, "difficulty": 4, "description": "Explore all possibilities, prune invalid paths. N-queens, subsets, permutations."},
    {"id": "c25", "name": "BFS (Breadth-First Search)", "tier": 5, "difficulty": 4, "description": "Level-order traversal, shortest path in unweighted graphs, multi-source BFS."},
    {"id": "c26", "name": "DFS (Depth-First Search)",   "tier": 5, "difficulty": 4, "description": "Path finding, connected components, cycle detection, topological sort via DFS."},
    {"id": "c27", "name": "Topological Sort",           "tier": 5, "difficulty": 4, "description": "Ordering of directed acyclic graph (DAG), Kahn's algo, course schedule problems."},
    {"id": "c28", "name": "Union Find",                 "tier": 5, "difficulty": 4, "description": "Disjoint set union, path compression, union by rank, cycle detection in undirected graphs."},
    {"id": "c29", "name": "Shortest Path Algorithms",   "tier": 5, "difficulty": 5, "description": "Dijkstra, Bellman-Ford, network delay time, cheapest flights within K stops."},
    {"id": "c30", "name": "Segment Trees",              "tier": 5, "difficulty": 5, "description": "Range queries and point updates in O(log n). Build, query, update operations."},
]

# Each tuple: (from_id, to_id) meaning from DEPENDS_ON to
# Read as: "to master X, you need Y first"
DEPENDS_ON_EDGES = [
    # Arrays foundations
    ("c02", "c01"),  # Arrays depends on Variables
    ("c03", "c01"),  # Strings depends on Variables
    ("c04", "c01"),  # Math depends on Variables
    ("c05", "c01"),  # Bit Manip depends on Variables

    # Core DS depend on Arrays
    ("c06", "c02"),  # Linked Lists → Arrays
    ("c07", "c02"),  # Stacks → Arrays
    ("c08", "c02"),  # Queues → Arrays
    ("c09", "c02"),  # Hash Maps → Arrays
    ("c10", "c02"),  # Recursion → Arrays (call stack analogy)

    # Trees / Graphs depend on DS
    ("c11", "c10"),  # Binary Trees → Recursion
    ("c11", "c06"),  # Binary Trees → Linked Lists (node concept)
    ("c12", "c11"),  # BST → Binary Trees
    ("c13", "c11"),  # Heaps → Binary Trees
    ("c14", "c09"),  # Graphs → Hash Maps (adjacency list)
    ("c14", "c06"),  # Graphs → Linked Lists (node lists)
    ("c15", "c09"),  # Tries → Hash Maps
    ("c15", "c10"),  # Tries → Recursion

    # Algorithms depend on DS
    ("c16", "c02"),  # Sorting → Arrays
    ("c17", "c02"),  # Binary Search → Arrays (sorted)
    ("c17", "c16"),  # Binary Search → Sorting (understand sorted)
    ("c18", "c02"),  # Two Pointers → Arrays
    ("c19", "c02"),  # Sliding Window → Arrays
    ("c19", "c09"),  # Sliding Window → Hash Maps (freq map)
    ("c20", "c02"),  # Prefix Sums → Arrays

    # Advanced
    ("c21", "c10"),  # D&C → Recursion
    ("c21", "c16"),  # D&C → Sorting (merge sort)
    ("c22", "c10"),  # DP → Recursion
    ("c22", "c20"),  # DP → Prefix Sums
    ("c23", "c16"),  # Greedy → Sorting
    ("c24", "c10"),  # Backtracking → Recursion
    ("c25", "c14"),  # BFS → Graphs
    ("c25", "c08"),  # BFS → Queues
    ("c26", "c14"),  # DFS → Graphs
    ("c26", "c07"),  # DFS → Stacks (implicit call stack)
    ("c26", "c10"),  # DFS → Recursion
    ("c27", "c26"),  # Topo Sort → DFS
    ("c27", "c14"),  # Topo Sort → Graphs
    ("c28", "c14"),  # Union Find → Graphs
    ("c29", "c25"),  # Shortest Path → BFS
    ("c29", "c13"),  # Shortest Path → Heaps (Dijkstra)
    ("c30", "c02"),  # Segment Trees → Arrays
    ("c30", "c10"),  # Segment Trees → Recursion
]
