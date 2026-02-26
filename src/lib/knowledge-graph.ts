import { Topic, KnowledgePoint, TopicCategory } from "./types";

function kp(
  topicId: string,
  level: 1 | 2 | 3,
  title: string,
  description: string
): KnowledgePoint {
  return { id: `${topicId}-kp${level}`, topicId, level, title, description };
}

function topic(
  id: string,
  name: string,
  description: string,
  category: TopicCategory,
  emoji: string,
  kpTitles: [string, string, string],
  kpDescs: [string, string, string],
  prerequisites: { topicId: string; encompassingWeight: number }[] = []
): Topic {
  return {
    id,
    name,
    description,
    category,
    emoji,
    knowledgePoints: [
      kp(id, 1, kpTitles[0], kpDescs[0]),
      kp(id, 2, kpTitles[1], kpDescs[1]),
      kp(id, 3, kpTitles[2], kpDescs[2]),
    ],
    prerequisites,
  };
}

// ── Whole Numbers ───────────────────────────────────────────────────

const WHOLE_NUMBER_TOPICS: Topic[] = [
  topic(
    "addition-basics",
    "Addition",
    "Adding whole numbers together",
    "whole-numbers",
    "➕",
    ["Single-Digit Addition", "Multi-Digit Addition", "Addition Word Problems"],
    [
      "Add numbers 0–9",
      "Add numbers with carrying (regrouping)",
      "Solve real-world addition problems",
    ]
  ),
  topic(
    "subtraction-basics",
    "Subtraction",
    "Subtracting whole numbers",
    "whole-numbers",
    "➖",
    ["Single-Digit Subtraction", "Multi-Digit Subtraction", "Subtraction Word Problems"],
    [
      "Subtract numbers 0–9",
      "Subtract with borrowing (regrouping)",
      "Solve real-world subtraction problems",
    ],
    [{ topicId: "addition-basics", encompassingWeight: 0.3 }]
  ),
  topic(
    "multiplication-basics",
    "Multiplication",
    "Multiplying whole numbers",
    "whole-numbers",
    "✖️",
    ["Times Tables", "Multi-Digit Multiplication", "Multiplication Word Problems"],
    [
      "Recall times tables through 12×12",
      "Multiply multi-digit numbers",
      "Solve real-world multiplication problems",
    ],
    [{ topicId: "addition-basics", encompassingWeight: 0.4 }]
  ),
  topic(
    "division-basics",
    "Division",
    "Dividing whole numbers",
    "whole-numbers",
    "➗",
    ["Basic Division Facts", "Long Division", "Division Word Problems"],
    [
      "Divide using multiplication facts",
      "Perform long division with remainders",
      "Solve real-world division problems",
    ],
    [
      { topicId: "multiplication-basics", encompassingWeight: 0.5 },
      { topicId: "subtraction-basics", encompassingWeight: 0.2 },
    ]
  ),
  topic(
    "factors-multiples",
    "Factors & Multiples",
    "Finding factors, multiples, primes, and composites",
    "whole-numbers",
    "🔢",
    ["Factors & Divisibility", "Multiples & LCM", "Prime & Composite Numbers"],
    [
      "List factors and use divisibility rules",
      "Find multiples and least common multiples",
      "Identify prime and composite numbers",
    ],
    [
      { topicId: "multiplication-basics", encompassingWeight: 0.3 },
      { topicId: "division-basics", encompassingWeight: 0.3 },
    ]
  ),
  topic(
    "order-of-operations",
    "Order of Operations",
    "Using PEMDAS to evaluate expressions",
    "whole-numbers",
    "📋",
    ["PEMDAS Basics", "Expressions with Parentheses", "Multi-Step Expressions"],
    [
      "Apply the correct order: multiply/divide before add/subtract",
      "Evaluate expressions with parentheses first",
      "Solve complex multi-step expressions",
    ],
    [
      { topicId: "multiplication-basics", encompassingWeight: 0.3 },
      { topicId: "division-basics", encompassingWeight: 0.3 },
      { topicId: "addition-basics", encompassingWeight: 0.2 },
      { topicId: "subtraction-basics", encompassingWeight: 0.2 },
    ]
  ),
  topic(
    "exponents-intro",
    "Exponents",
    "Understanding powers and squared/cubed numbers",
    "whole-numbers",
    "⬆️",
    ["Squares & Cubes", "Evaluating Powers", "Exponent Expressions"],
    [
      "Calculate squares and cubes of small numbers",
      "Evaluate expressions like 2⁵",
      "Simplify expressions containing exponents",
    ],
    [{ topicId: "multiplication-basics", encompassingWeight: 0.4 }]
  ),
  topic(
    "negative-integers",
    "Negative Integers",
    "Working with numbers below zero",
    "whole-numbers",
    "🌡️",
    ["Number Line & Negatives", "Adding & Subtracting Integers", "Multiplying & Dividing Integers"],
    [
      "Place negative numbers on a number line",
      "Add and subtract positive and negative integers",
      "Multiply and divide integers",
    ],
    [
      { topicId: "addition-basics", encompassingWeight: 0.3 },
      { topicId: "subtraction-basics", encompassingWeight: 0.3 },
      { topicId: "multiplication-basics", encompassingWeight: 0.2 },
    ]
  ),
];

// ── Fractions ───────────────────────────────────────────────────────

const FRACTION_TOPICS: Topic[] = [
  topic(
    "fractions-intro",
    "Understanding Fractions",
    "What fractions mean and how to read them",
    "fractions",
    "🍕",
    ["Parts of a Whole", "Equivalent Fractions", "Comparing Fractions"],
    [
      "Identify numerator, denominator, and what fractions represent",
      "Find equivalent fractions by multiplying/dividing",
      "Compare fractions using common denominators or cross-multiplication",
    ],
    [{ topicId: "division-basics", encompassingWeight: 0.2 }]
  ),
  topic(
    "fractions-add-sub",
    "Adding & Subtracting Fractions",
    "Add and subtract fractions with like and unlike denominators",
    "fractions",
    "🧮",
    ["Like Denominators", "Unlike Denominators", "Mixed Numbers"],
    [
      "Add and subtract fractions with the same denominator",
      "Find common denominators and add/subtract",
      "Add and subtract mixed numbers",
    ],
    [
      { topicId: "fractions-intro", encompassingWeight: 0.5 },
      { topicId: "factors-multiples", encompassingWeight: 0.3 },
    ]
  ),
  topic(
    "fractions-multiply",
    "Multiplying Fractions",
    "Multiply fractions and mixed numbers",
    "fractions",
    "✨",
    ["Fraction × Fraction", "Fraction × Whole Number", "Mixed Number Multiplication"],
    [
      "Multiply two fractions (numerator × numerator, denominator × denominator)",
      "Multiply a fraction by a whole number",
      "Convert mixed numbers and multiply",
    ],
    [
      { topicId: "fractions-intro", encompassingWeight: 0.4 },
      { topicId: "multiplication-basics", encompassingWeight: 0.3 },
    ]
  ),
  topic(
    "fractions-divide",
    "Dividing Fractions",
    "Divide fractions using reciprocals",
    "fractions",
    "🔄",
    ["Reciprocals", "Fraction ÷ Fraction", "Mixed Number Division"],
    [
      "Find the reciprocal of a fraction",
      "Divide fractions by multiplying by the reciprocal",
      "Divide mixed numbers",
    ],
    [
      { topicId: "fractions-multiply", encompassingWeight: 0.5 },
      { topicId: "division-basics", encompassingWeight: 0.3 },
    ]
  ),
  topic(
    "simplifying-fractions",
    "Simplifying Fractions",
    "Reduce fractions to lowest terms using GCF",
    "fractions",
    "✂️",
    ["Finding GCF", "Reducing to Lowest Terms", "Simplifying in Context"],
    [
      "Find the greatest common factor of two numbers",
      "Divide numerator and denominator by GCF",
      "Simplify fractions within word problems",
    ],
    [
      { topicId: "fractions-intro", encompassingWeight: 0.4 },
      { topicId: "factors-multiples", encompassingWeight: 0.5 },
    ]
  ),
];

// ── Decimals ────────────────────────────────────────────────────────

const DECIMAL_TOPICS: Topic[] = [
  topic(
    "decimals-intro",
    "Understanding Decimals",
    "Place value and reading decimal numbers",
    "decimals",
    "📍",
    ["Decimal Place Value", "Comparing Decimals", "Rounding Decimals"],
    [
      "Identify tenths, hundredths, thousandths places",
      "Compare and order decimal numbers",
      "Round decimals to a given place",
    ],
    [{ topicId: "fractions-intro", encompassingWeight: 0.3 }]
  ),
  topic(
    "decimals-add-sub",
    "Adding & Subtracting Decimals",
    "Line up decimal points and compute",
    "decimals",
    "🔵",
    ["Adding Decimals", "Subtracting Decimals", "Decimal Word Problems"],
    [
      "Add decimals by aligning place values",
      "Subtract decimals by aligning place values",
      "Solve real-world decimal addition/subtraction problems",
    ],
    [
      { topicId: "decimals-intro", encompassingWeight: 0.5 },
      { topicId: "addition-basics", encompassingWeight: 0.2 },
      { topicId: "subtraction-basics", encompassingWeight: 0.2 },
    ]
  ),
  topic(
    "decimals-multiply",
    "Multiplying Decimals",
    "Multiply decimals and count decimal places",
    "decimals",
    "🟢",
    ["Decimal × Whole Number", "Decimal × Decimal", "Placement of Decimal Point"],
    [
      "Multiply a decimal by a whole number",
      "Multiply two decimals together",
      "Determine the correct position of the decimal point",
    ],
    [
      { topicId: "decimals-intro", encompassingWeight: 0.4 },
      { topicId: "multiplication-basics", encompassingWeight: 0.3 },
    ]
  ),
  topic(
    "decimals-divide",
    "Dividing Decimals",
    "Divide with decimals in the dividend and divisor",
    "decimals",
    "🟡",
    ["Decimal ÷ Whole Number", "Whole Number ÷ Decimal", "Decimal ÷ Decimal"],
    [
      "Divide a decimal by a whole number",
      "Divide a whole number by a decimal",
      "Divide two decimals by shifting the decimal point",
    ],
    [
      { topicId: "decimals-multiply", encompassingWeight: 0.3 },
      { topicId: "division-basics", encompassingWeight: 0.4 },
    ]
  ),
  topic(
    "fraction-decimal-conversion",
    "Fractions ↔ Decimals",
    "Convert between fractions and decimals",
    "decimals",
    "🔀",
    ["Fraction → Decimal", "Decimal → Fraction", "Repeating Decimals"],
    [
      "Convert a fraction to a decimal by dividing",
      "Convert a terminating decimal to a fraction",
      "Recognize and convert repeating decimals",
    ],
    [
      { topicId: "fractions-intro", encompassingWeight: 0.4 },
      { topicId: "decimals-intro", encompassingWeight: 0.4 },
      { topicId: "division-basics", encompassingWeight: 0.2 },
    ]
  ),
];

// ── Percentages ─────────────────────────────────────────────────────

const PERCENTAGE_TOPICS: Topic[] = [
  topic(
    "percentages-intro",
    "Understanding Percentages",
    "What percentages mean and common conversions",
    "percentages",
    "💯",
    ["Percent Meaning", "Common Percent ↔ Fraction ↔ Decimal", "Comparing with Percentages"],
    [
      "Understand that percent means 'out of 100'",
      "Convert between common percentages, fractions, and decimals",
      "Use percentages to compare quantities",
    ],
    [
      { topicId: "fraction-decimal-conversion", encompassingWeight: 0.5 },
    ]
  ),
  topic(
    "finding-percent-of",
    "Finding a Percent of a Number",
    "Calculate a percentage of a given number",
    "percentages",
    "🎯",
    ["Percent of a Number", "Discount & Tax", "Tip & Markup"],
    [
      "Calculate a percentage of a number (e.g., 25% of 80)",
      "Find sale prices and tax amounts",
      "Calculate tips and markups",
    ],
    [
      { topicId: "percentages-intro", encompassingWeight: 0.5 },
      { topicId: "decimals-multiply", encompassingWeight: 0.3 },
    ]
  ),
  topic(
    "percent-change",
    "Percent Increase & Decrease",
    "Calculate how much something went up or down in percentage terms",
    "percentages",
    "📈",
    ["Percent Increase", "Percent Decrease", "Real-World Percent Change"],
    [
      "Calculate percent increase",
      "Calculate percent decrease",
      "Apply percent change to sports stats, prices, and scores",
    ],
    [
      { topicId: "finding-percent-of", encompassingWeight: 0.5 },
      { topicId: "subtraction-basics", encompassingWeight: 0.1 },
    ]
  ),
];

// ── Ratios & Proportions ────────────────────────────────────────────

const RATIO_TOPICS: Topic[] = [
  topic(
    "ratios-intro",
    "Understanding Ratios",
    "Comparing quantities using ratios",
    "ratios",
    "⚖️",
    ["Writing Ratios", "Equivalent Ratios", "Ratio Tables"],
    [
      "Write ratios in three forms (a:b, a/b, a to b)",
      "Find equivalent ratios by scaling",
      "Complete and use ratio tables",
    ],
    [
      { topicId: "fractions-intro", encompassingWeight: 0.3 },
      { topicId: "multiplication-basics", encompassingWeight: 0.2 },
    ]
  ),
  topic(
    "unit-rates",
    "Unit Rates",
    "Find and use rates per one unit",
    "ratios",
    "🏎️",
    ["Finding Unit Rates", "Comparing Unit Rates", "Unit Rate Word Problems"],
    [
      "Calculate a rate per one unit (e.g., miles per hour)",
      "Compare unit rates to find the better deal",
      "Solve real-world unit rate problems",
    ],
    [
      { topicId: "ratios-intro", encompassingWeight: 0.4 },
      { topicId: "division-basics", encompassingWeight: 0.3 },
    ]
  ),
  topic(
    "proportions",
    "Proportions",
    "Solving proportional relationships",
    "ratios",
    "🔗",
    ["Setting Up Proportions", "Cross-Multiplication", "Proportion Word Problems"],
    [
      "Write a proportion from a word problem",
      "Solve proportions using cross-multiplication",
      "Apply proportions to maps, recipes, and scale models",
    ],
    [
      { topicId: "unit-rates", encompassingWeight: 0.4 },
      { topicId: "fractions-multiply", encompassingWeight: 0.2 },
    ]
  ),
];

// ── Geometry ────────────────────────────────────────────────────────

const GEOMETRY_TOPICS: Topic[] = [
  topic(
    "angles-intro",
    "Angles",
    "Types and measurement of angles",
    "geometry",
    "📐",
    ["Types of Angles", "Measuring Angles", "Angle Relationships"],
    [
      "Identify acute, right, obtuse, and straight angles",
      "Estimate and measure angles in degrees",
      "Find missing angles using supplementary and complementary relationships",
    ],
    [
      { topicId: "addition-basics", encompassingWeight: 0.1 },
      { topicId: "subtraction-basics", encompassingWeight: 0.1 },
    ]
  ),
  topic(
    "perimeter",
    "Perimeter",
    "Finding the distance around shapes",
    "geometry",
    "🔲",
    ["Perimeter of Rectangles", "Perimeter of Irregular Shapes", "Perimeter Word Problems"],
    [
      "Calculate perimeter of rectangles and squares",
      "Find perimeter of composite/irregular shapes",
      "Solve real-world perimeter problems",
    ],
    [{ topicId: "addition-basics", encompassingWeight: 0.3 }]
  ),
  topic(
    "area-rectangles",
    "Area of Rectangles",
    "Length × width and square units",
    "geometry",
    "⬜",
    ["Area Formula", "Area of Composite Shapes", "Area Word Problems"],
    [
      "Use length × width to find area",
      "Break composite shapes into rectangles and add areas",
      "Solve real-world area problems",
    ],
    [{ topicId: "multiplication-basics", encompassingWeight: 0.4 }]
  ),
  topic(
    "area-triangles",
    "Area of Triangles",
    "Half base times height",
    "geometry",
    "🔺",
    ["Triangle Area Formula", "Finding Missing Dimensions", "Triangle Word Problems"],
    [
      "Apply ½ × base × height",
      "Find a missing base or height given the area",
      "Solve real-world triangle area problems",
    ],
    [
      { topicId: "area-rectangles", encompassingWeight: 0.4 },
      { topicId: "fractions-multiply", encompassingWeight: 0.2 },
    ]
  ),
  topic(
    "area-circles",
    "Area & Circumference of Circles",
    "Using π to find circle measurements",
    "geometry",
    "⭕",
    ["Circumference (πd)", "Area (πr²)", "Circle Word Problems"],
    [
      "Calculate circumference using C = πd",
      "Calculate area using A = πr²",
      "Solve real-world circle problems",
    ],
    [
      { topicId: "decimals-multiply", encompassingWeight: 0.3 },
      { topicId: "exponents-intro", encompassingWeight: 0.2 },
    ]
  ),
  topic(
    "volume-intro",
    "Volume",
    "Measuring 3D space in cubic units",
    "geometry",
    "📦",
    ["Volume of Rectangular Prisms", "Volume of Composite Solids", "Volume Word Problems"],
    [
      "Use length × width × height",
      "Find volume of composite rectangular solids",
      "Solve real-world volume problems (like Lego bricks!)",
    ],
    [
      { topicId: "area-rectangles", encompassingWeight: 0.4 },
      { topicId: "multiplication-basics", encompassingWeight: 0.3 },
    ]
  ),
  topic(
    "coordinate-plane",
    "Coordinate Plane",
    "Plotting and reading points on a grid",
    "geometry",
    "📊",
    ["Ordered Pairs", "Plotting Points", "Distance on the Grid"],
    [
      "Read and write ordered pairs (x, y)",
      "Plot points in all four quadrants",
      "Find distances between points on the grid",
    ],
    [
      { topicId: "negative-integers", encompassingWeight: 0.3 },
      { topicId: "addition-basics", encompassingWeight: 0.1 },
    ]
  ),
];

// ── Algebra ─────────────────────────────────────────────────────────

const ALGEBRA_TOPICS: Topic[] = [
  topic(
    "variables-expressions",
    "Variables & Expressions",
    "Using letters to represent unknown numbers",
    "algebra",
    "🔤",
    ["What Variables Mean", "Evaluating Expressions", "Writing Expressions"],
    [
      "Understand that a variable stands for an unknown value",
      "Substitute a number for a variable and evaluate",
      "Translate words into algebraic expressions",
    ],
    [{ topicId: "order-of-operations", encompassingWeight: 0.4 }]
  ),
  topic(
    "one-step-equations",
    "One-Step Equations",
    "Solving equations with one operation",
    "algebra",
    "⚡",
    ["Addition/Subtraction Equations", "Multiplication/Division Equations", "Equation Word Problems"],
    [
      "Solve x + a = b and x − a = b",
      "Solve ax = b and x/a = b",
      "Write and solve one-step equations from word problems",
    ],
    [
      { topicId: "variables-expressions", encompassingWeight: 0.5 },
      { topicId: "division-basics", encompassingWeight: 0.2 },
    ]
  ),
  topic(
    "two-step-equations",
    "Two-Step Equations",
    "Solving equations with two operations",
    "algebra",
    "🪜",
    ["Solving 2-Step Equations", "Equations with Fractions", "Two-Step Word Problems"],
    [
      "Solve equations like 2x + 3 = 11",
      "Solve two-step equations involving fractions",
      "Write and solve two-step equations from word problems",
    ],
    [
      { topicId: "one-step-equations", encompassingWeight: 0.5 },
      { topicId: "fractions-add-sub", encompassingWeight: 0.2 },
    ]
  ),
  topic(
    "inequalities-intro",
    "Inequalities",
    "Working with greater than and less than",
    "algebra",
    "↔️",
    ["Writing Inequalities", "Solving One-Step Inequalities", "Graphing on a Number Line"],
    [
      "Write inequalities using <, >, ≤, ≥",
      "Solve one-step inequalities",
      "Graph solutions on a number line",
    ],
    [
      { topicId: "one-step-equations", encompassingWeight: 0.4 },
      { topicId: "negative-integers", encompassingWeight: 0.2 },
    ]
  ),
  topic(
    "patterns-sequences",
    "Patterns & Sequences",
    "Identifying and extending number patterns",
    "algebra",
    "🔁",
    ["Arithmetic Sequences", "Pattern Rules", "Input-Output Tables"],
    [
      "Find the next terms in an arithmetic sequence",
      "Write a rule for a pattern (e.g., 'add 3')",
      "Complete input-output tables using a rule",
    ],
    [
      { topicId: "addition-basics", encompassingWeight: 0.2 },
      { topicId: "multiplication-basics", encompassingWeight: 0.2 },
    ]
  ),
];

// ── Data & Statistics ───────────────────────────────────────────────

const DATA_TOPICS: Topic[] = [
  topic(
    "mean-median-mode",
    "Mean, Median & Mode",
    "Measures of central tendency",
    "data",
    "📉",
    ["Finding the Mean", "Finding Median & Mode", "Choosing the Best Measure"],
    [
      "Calculate the average (mean) of a data set",
      "Find the median (middle) and mode (most frequent)",
      "Decide which measure best represents the data",
    ],
    [
      { topicId: "addition-basics", encompassingWeight: 0.2 },
      { topicId: "division-basics", encompassingWeight: 0.3 },
    ]
  ),
  topic(
    "reading-graphs",
    "Reading Graphs & Charts",
    "Interpreting bar graphs, line graphs, and pie charts",
    "data",
    "📊",
    ["Bar & Line Graphs", "Pie Charts", "Drawing Conclusions"],
    [
      "Read and interpret bar and line graphs",
      "Read and interpret pie/circle charts",
      "Make predictions and draw conclusions from graphs",
    ],
    [
      { topicId: "fractions-intro", encompassingWeight: 0.1 },
      { topicId: "percentages-intro", encompassingWeight: 0.2 },
    ]
  ),
  topic(
    "probability-intro",
    "Basic Probability",
    "Chances and likelihood of events",
    "data",
    "🎲",
    ["Probability as a Fraction", "Experimental vs. Theoretical", "Compound Events"],
    [
      "Express probability as a fraction between 0 and 1",
      "Compare experimental results to theoretical probability",
      "Find probability of combined events",
    ],
    [
      { topicId: "fractions-intro", encompassingWeight: 0.3 },
      { topicId: "decimals-intro", encompassingWeight: 0.2 },
    ]
  ),
];

// ── Word Problems (Cross-Cutting) ───────────────────────────────────

const WORD_PROBLEM_TOPICS: Topic[] = [
  topic(
    "multi-step-word-problems",
    "Multi-Step Word Problems",
    "Breaking down complex problems into steps",
    "word-problems",
    "🧩",
    ["Identifying Steps", "Choosing Operations", "Solving & Checking"],
    [
      "Read a word problem and identify what steps are needed",
      "Decide which operations to use at each step",
      "Solve multi-step problems and verify the answer makes sense",
    ],
    [
      { topicId: "addition-basics", encompassingWeight: 0.1 },
      { topicId: "subtraction-basics", encompassingWeight: 0.1 },
      { topicId: "multiplication-basics", encompassingWeight: 0.1 },
      { topicId: "division-basics", encompassingWeight: 0.1 },
    ]
  ),
  topic(
    "money-math",
    "Money Math",
    "Working with dollars and cents",
    "word-problems",
    "💰",
    ["Counting Money", "Making Change", "Budgeting Problems"],
    [
      "Add and subtract money amounts",
      "Calculate change and compare prices",
      "Solve budgeting and shopping problems",
    ],
    [
      { topicId: "decimals-add-sub", encompassingWeight: 0.4 },
      { topicId: "decimals-multiply", encompassingWeight: 0.2 },
    ]
  ),
  topic(
    "time-distance-speed",
    "Time, Distance & Speed",
    "Relationship between distance, speed, and time",
    "word-problems",
    "🏒",
    ["Reading Time", "Distance = Speed × Time", "Speed & Rate Problems"],
    [
      "Convert between hours, minutes, and seconds",
      "Use the formula distance = speed × time",
      "Solve real-world speed problems (hockey pucks, racing, etc.)",
    ],
    [
      { topicId: "multiplication-basics", encompassingWeight: 0.2 },
      { topicId: "division-basics", encompassingWeight: 0.2 },
      { topicId: "unit-rates", encompassingWeight: 0.3 },
    ]
  ),
  topic(
    "measurement-conversion",
    "Measurement & Conversion",
    "Converting between units of measurement",
    "word-problems",
    "📏",
    ["Metric Units", "Customary Units", "Converting Between Systems"],
    [
      "Convert within metric (mm, cm, m, km; g, kg; mL, L)",
      "Convert within customary (in, ft, yd; oz, lb; cups, gal)",
      "Approximate conversions between metric and customary",
    ],
    [
      { topicId: "multiplication-basics", encompassingWeight: 0.2 },
      { topicId: "division-basics", encompassingWeight: 0.2 },
      { topicId: "decimals-multiply", encompassingWeight: 0.2 },
    ]
  ),
];

// ── Combined Graph ──────────────────────────────────────────────────

export const ALL_TOPICS: Topic[] = [
  ...WHOLE_NUMBER_TOPICS,
  ...FRACTION_TOPICS,
  ...DECIMAL_TOPICS,
  ...PERCENTAGE_TOPICS,
  ...RATIO_TOPICS,
  ...GEOMETRY_TOPICS,
  ...ALGEBRA_TOPICS,
  ...DATA_TOPICS,
  ...WORD_PROBLEM_TOPICS,
];

export const TOPICS_BY_ID: Record<string, Topic> = Object.fromEntries(
  ALL_TOPICS.map((t) => [t.id, t])
);

export const TOPICS_BY_CATEGORY: Record<TopicCategory, Topic[]> = ALL_TOPICS.reduce(
  (acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  },
  {} as Record<TopicCategory, Topic[]>
);

export function getPrerequisiteTopics(topicId: string): Topic[] {
  const topic = TOPICS_BY_ID[topicId];
  if (!topic) return [];
  return topic.prerequisites
    .map((p) => TOPICS_BY_ID[p.topicId])
    .filter(Boolean);
}

export function getDependentTopics(topicId: string): Topic[] {
  return ALL_TOPICS.filter((t) =>
    t.prerequisites.some((p) => p.topicId === topicId)
  );
}

export function getTopicsWithNoPrerequisites(): Topic[] {
  return ALL_TOPICS.filter((t) => t.prerequisites.length === 0);
}

export function getEncompassingWeight(
  advancedTopicId: string,
  prerequisiteTopicId: string
): number {
  const topic = TOPICS_BY_ID[advancedTopicId];
  if (!topic) return 0;
  const edge = topic.prerequisites.find((p) => p.topicId === prerequisiteTopicId);
  return edge?.encompassingWeight ?? 0;
}
