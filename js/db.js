// AI Study Planner Database & Storage Configuration

// Predefined syllabus data for major exams
const EXAM_PRESETS = {
  "jee": {
    name: "JEE (Joint Entrance Examination)",
    subjects: [
      {
        name: "Physics",
        topics: [
          { name: "Mechanics (Kinematics, Laws of Motion)", difficulty: "Hard", completed: false },
          { name: "Electromagnetism (Electrostatics, Current, Magnetism)", difficulty: "Hard", completed: false },
          { name: "Optics & Wave Motion", difficulty: "Medium", completed: false },
          { name: "Thermodynamics & Kinetic Theory", difficulty: "Medium", completed: false },
          { name: "Modern Physics (Dual Nature, Atoms, Nuclei)", difficulty: "Easy", completed: false }
        ]
      },
      {
        name: "Chemistry",
        topics: [
          { name: "Physical Chemistry (Chemical Kinetics, Equilibrium)", difficulty: "Hard", completed: false },
          { name: "Organic Chemistry (Hydrocarbons, Carbonyl Compounds)", difficulty: "Hard", completed: false },
          { name: "Inorganic Chemistry (Coordination Compounds, p-Block)", difficulty: "Medium", completed: false },
          { name: "Atomic Structure & Chemical Bonding", difficulty: "Easy", completed: false },
          { name: "Environmental Chemistry & Biomolecules", difficulty: "Easy", completed: false }
        ]
      },
      {
        name: "Mathematics",
        topics: [
          { name: "Calculus (Limits, Derivatives, Integration)", difficulty: "Hard", completed: false },
          { name: "Coordinate Geometry (Conic Sections, Straight Lines)", difficulty: "Hard", completed: false },
          { name: "Algebra (Matrices, Determinants, Probability)", difficulty: "Medium", completed: false },
          { name: "Trigonometry & Inverse Functions", difficulty: "Medium", completed: false },
          { name: "Vector & 3D Geometry", difficulty: "Easy", completed: false }
        ]
      }
    ]
  },
  "neet": {
    name: "NEET (National Eligibility cum Entrance Test)",
    subjects: [
      {
        name: "Biology",
        topics: [
          { name: "Human Physiology", difficulty: "Hard", completed: false },
          { name: "Genetics & Evolution", difficulty: "Hard", completed: false },
          { name: "Plant Physiology & Photosynthesis", difficulty: "Medium", completed: false },
          { name: "Cell Biology & Division", difficulty: "Easy", completed: false },
          { name: "Ecology & Environment", difficulty: "Easy", completed: false },
          { name: "Diversity in Living World", difficulty: "Easy", completed: false }
        ]
      },
      {
        name: "Physics",
        topics: [
          { name: "Mechanics & Fluid Dynamics", difficulty: "Hard", completed: false },
          { name: "Electrodynamics & Semiconductor Devices", difficulty: "Hard", completed: false },
          { name: "Thermodynamics & SHM", difficulty: "Medium", completed: false },
          { name: "Optics & Wave Theory", difficulty: "Medium", completed: false },
          { name: "Modern Physics & Atoms", difficulty: "Easy", completed: false }
        ]
      },
      {
        name: "Chemistry",
        topics: [
          { name: "Organic Chemistry Mechanisms", difficulty: "Hard", completed: false },
          { name: "Chemical Thermodynamics & Equilibrium", difficulty: "Hard", completed: false },
          { name: "Coordination & d-f Block Elements", difficulty: "Medium", completed: false },
          { name: "Periodic Classification & s-Block", difficulty: "Easy", completed: false },
          { name: "Solutions & Electrochemistry", difficulty: "Medium", completed: false }
        ]
      }
    ]
  },
  "gate": {
    name: "GATE CS (Computer Science)",
    subjects: [
      {
        name: "Core Computer Science",
        topics: [
          { name: "Algorithms & Asymptotic Notations", difficulty: "Hard", completed: false },
          { name: "Theory of Computation & Automata", difficulty: "Hard", completed: false },
          { name: "Compiler Design (Parsing, Code Gen)", difficulty: "Medium", completed: false },
          { name: "Operating Systems (CPU Scheduling, Memory)", difficulty: "Medium", completed: false },
          { name: "Database Management Systems (Normalization, SQL)", difficulty: "Medium", completed: false },
          { name: "Computer Networks (TCP/IP, Routing)", difficulty: "Hard", completed: false }
        ]
      },
      {
        name: "Mathematics & Aptitude",
        topics: [
          { name: "Linear Algebra & Matrices", difficulty: "Medium", completed: false },
          { name: "Discrete Mathematics & Graph Theory", difficulty: "Hard", completed: false },
          { name: "Probability & Statistics", difficulty: "Medium", completed: false },
          { name: "Numerical Methods & Calculus", difficulty: "Easy", completed: false },
          { name: "Verbal & Quantitative Aptitude", difficulty: "Easy", completed: false }
        ]
      }
    ]
  },
  "upsc": {
    name: "UPSC (Civil Services Exam)",
    subjects: [
      {
        name: "General Studies I",
        topics: [
          { name: "Indian History (Ancient, Medieval, Modern)", difficulty: "Hard", completed: false },
          { name: "Geography (Physical, India, World)", difficulty: "Hard", completed: false },
          { name: "Indian Polity & Constitution", difficulty: "Medium", completed: false },
          { name: "Indian Economy & Development", difficulty: "Medium", completed: false },
          { name: "Environment, Ecology & Climate", difficulty: "Medium", completed: false },
          { name: "Current Affairs (National & International)", difficulty: "Hard", completed: false }
        ]
      },
      {
        name: "CSAT (General Studies II)",
        topics: [
          { name: "Logical Reasoning & Analytical Ability", difficulty: "Medium", completed: false },
          { name: "Quantitative Aptitude & Data Interpretation", difficulty: "Medium", completed: false },
          { name: "Reading Comprehension & Interpersonal Skills", difficulty: "Easy", completed: false }
        ]
      }
    ]
  },
  "semester": {
    name: "Semester Exams (Engineering)",
    subjects: [
      {
        name: "Core Subjects",
        topics: [
          { name: "Mathematics III (Fourier & Laplace)", difficulty: "Hard", completed: false },
          { name: "Data Structures & Algorithm Design", difficulty: "Hard", completed: false },
          { name: "Digital Logic Design & Circuits", difficulty: "Medium", completed: false },
          { name: "Object Oriented Programming (C++/Java)", difficulty: "Easy", completed: false },
          { name: "Technical Communication & Ethics", difficulty: "Easy", completed: false }
        ]
      }
    ]
  },
  "placement": {
    name: "Placement Preparation",
    subjects: [
      {
        name: "Technical & Professional",
        topics: [
          { name: "Data Structures (Arrays, Lists, Trees)", difficulty: "Hard", completed: false },
          { name: "Algorithm Practice (DP, Graphs, Greedy)", difficulty: "Hard", completed: false },
          { name: "System Design (Lld & Hld principles)", difficulty: "Hard", completed: false },
          { name: "Operating Systems, DBMS & SQL Queries", difficulty: "Medium", completed: false },
          { name: "Object Oriented Design Patterns", difficulty: "Medium", completed: false },
          { name: "Aptitude, Puzzles & Resume Prep", difficulty: "Easy", completed: false }
        ]
      }
    ]
  },
  "ssc": {
    name: "SSC CGL Exam",
    subjects: [
      {
        name: "Exam Sections",
        topics: [
          { name: "Quantitative Aptitude (Arithmetic, Advanced Math)", difficulty: "Hard", completed: false },
          { name: "General Intelligence & Reasoning", difficulty: "Medium", completed: false },
          { name: "English Language & Comprehension", difficulty: "Easy", completed: false },
          { name: "General Awareness (History, Science, Current Events)", difficulty: "Hard", completed: false }
        ]
      }
    ]
  },
  "bank": {
    name: "Bank PO / Clerk Exams",
    subjects: [
      {
        name: "Exam Sections",
        topics: [
          { name: "Quantitative Aptitude & Data Sufficiency", difficulty: "Hard", completed: false },
          { name: "Logical Reasoning & Puzzles", difficulty: "Hard", completed: false },
          { name: "English Language & Grammar", difficulty: "Medium", completed: false },
          { name: "Banking & Financial Awareness", difficulty: "Medium", completed: false },
          { name: "Computer Knowledge & Aptitude", difficulty: "Easy", completed: false }
        ]
      }
    ]
  },
  "custom": {
    name: "Custom Exam",
    subjects: [
      {
        name: "General",
        topics: [
          { name: "Sample Topic 1 (Click edit to modify)", difficulty: "Easy", completed: false }
        ]
      }
    ]
  },
  "cds": {
    name: "CDS (Combined Defence Services)",
    subjects: [
      {
        name: "General Knowledge",
        topics: [
          { name: "Indian Constitution & Polity", difficulty: "Medium", completed: false },
          { name: "Indian & World Geography", difficulty: "Hard", completed: false },
          { name: "Modern Indian History", difficulty: "Medium", completed: false },
          { name: "General Physics & Chemistry", difficulty: "Easy", completed: false },
          { name: "Current Affairs & Defense News", difficulty: "Medium", completed: false }
        ]
      },
      {
        name: "English Language",
        topics: [
          { name: "Reading Comprehension & Passages", difficulty: "Medium", completed: false },
          { name: "Spotting Errors & Sentence Correction", difficulty: "Hard", completed: false },
          { name: "Synonyms & Antonyms (Vocabulary)", difficulty: "Medium", completed: false },
          { name: "Idioms, Phrases & Cloze Test", difficulty: "Easy", completed: false }
        ]
      },
      {
        name: "Elementary Mathematics",
        topics: [
          { name: "Arithmetic (Ratio, Percentage, Time & Work)", difficulty: "Medium", completed: false },
          { name: "Algebra & Quadratic Equations", difficulty: "Hard", completed: false },
          { name: "Trigonometry & Height-Distance", difficulty: "Hard", completed: false },
          { name: "Geometry & Mensuration (2D & 3D)", difficulty: "Hard", completed: false },
          { name: "Statistics & Data Handling", difficulty: "Easy", completed: false }
        ]
      }
    ]
  },
  "nda": {
    name: "NDA (National Defence Academy)",
    subjects: [
      {
        name: "Mathematics",
        topics: [
          { name: "Algebra (Complex Numbers, Progressions)", difficulty: "Medium", completed: false },
          { name: "Trigonometry (Identities, Inverse)", difficulty: "Medium", completed: false },
          { name: "Analytical Geometry (2D & 3D)", difficulty: "Hard", completed: false },
          { name: "Differential & Integral Calculus", difficulty: "Hard", completed: false },
          { name: "Vector Algebra", difficulty: "Medium", completed: false },
          { name: "Probability & Statistics", difficulty: "Hard", completed: false }
        ]
      },
      {
        name: "General Ability Test (GAT)",
        topics: [
          { name: "English Grammar & Vocabulary", difficulty: "Medium", completed: false },
          { name: "General Physics & Mechanics", difficulty: "Medium", completed: false },
          { name: "General Chemistry & Physical Laws", difficulty: "Easy", completed: false },
          { name: "Indian History & Freedom Movement", difficulty: "Medium", completed: false },
          { name: "Geography & Climate Zones", difficulty: "Medium", completed: false },
          { name: "Current National & International Events", difficulty: "Easy", completed: false }
        ]
      }
    ]
  },
  "tgc": {
    name: "TGC (Technical Graduate Course)",
    subjects: [
      {
        name: "Core Engineering Concepts",
        topics: [
          { name: "Engineering Mathematics & Calculus", difficulty: "Hard", completed: false },
          { name: "Structural / Machine Design Principles", difficulty: "Hard", completed: false },
          { name: "Control Systems & Instrumentation", difficulty: "Medium", completed: false },
          { name: "Data Structures & Computer Architecture", difficulty: "Medium", completed: false }
        ]
      },
      {
        name: "Military Aptitude & GK",
        topics: [
          { name: "Verbal & Non-Verbal Reasoning", difficulty: "Medium", completed: false },
          { name: "Spatial & Mechanical Reasoning", difficulty: "Hard", completed: false },
          { name: "Defense Security & General Science", difficulty: "Easy", completed: false },
          { name: "Military History & Strategic Awareness", difficulty: "Easy", completed: false }
        ]
      }
    ]
  },
  "lawyer": {
    name: "Lawyer Exams (CLAT / Judiciary)",
    subjects: [
      {
        name: "Legal Reasoning",
        topics: [
          { name: "Constitutional Law & Principles", difficulty: "Hard", completed: false },
          { name: "Law of Torts & Negligence", difficulty: "Medium", completed: false },
          { name: "Law of Contracts & Agreements", difficulty: "Hard", completed: false },
          { name: "Criminal Law & Indian Penal Code", difficulty: "Hard", completed: false }
        ]
      },
      {
        name: "Logical Reasoning & English",
        topics: [
          { name: "Critical Reasoning & Syllogisms", difficulty: "Medium", completed: false },
          { name: "English Reading & Vocabulary", difficulty: "Medium", completed: false }
        ]
      },
      {
        name: "General Knowledge & Math",
        topics: [
          { name: "Current Legal Affairs & News", difficulty: "Medium", completed: false },
          { name: "Quantitative Techniques & Graphs", difficulty: "Easy", completed: false }
        ]
      }
    ]
  },
  "govt_eng": {
    name: "Govt Engineering Exams (ESE/IES)",
    subjects: [
      {
        name: "General Studies & Aptitude",
        topics: [
          { name: "Engineering Mathematics & Numerical Methods", difficulty: "Hard", completed: false },
          { name: "General Principles of Design & Drawing", difficulty: "Medium", completed: false },
          { name: "Standards and Quality Practices", difficulty: "Medium", completed: false },
          { name: "Basics of Energy & Environment", difficulty: "Easy", completed: false },
          { name: "Ethics and Values in Engineering", difficulty: "Easy", completed: false }
        ]
      },
      {
        name: "Technical Specialization",
        topics: [
          { name: "Network Analysis & Circuit Theory", difficulty: "Medium", completed: false },
          { name: "Electrical & Electronic Measurements", difficulty: "Easy", completed: false },
          { name: "Control Systems & Signal Processing", difficulty: "Hard", completed: false },
          { name: "Analog & Digital Electronics", difficulty: "Medium", completed: false },
          { name: "Power Systems & Electrical Machines", difficulty: "Hard", completed: false }
        ]
      }
    ]
  }
};

// Curriculum presets database for Semester Exams
const SEMESTER_DEPARTMENTS = {
  "cse": {
    name: "Computer Science & Engineering",
    semesters: {
      1: [
        { name: "Engineering Mathematics I", topics: [{ name: "Calculus & Infinite Series", difficulty: "Medium", completed: false }, { name: "Linear Algebra & Matrices", difficulty: "Medium", completed: false }] },
        { name: "Engineering Physics", topics: [{ name: "Quantum Mechanics Basics", difficulty: "Hard", completed: false }, { name: "Fiber Optics & Lasers", difficulty: "Easy", completed: false }] },
        { name: "Computer Programming", topics: [{ name: "C Language Syntax & Operators", difficulty: "Easy", completed: false }, { name: "Pointers & Memory Allocation", difficulty: "Hard", completed: false }] }
      ],
      2: [
        { name: "Engineering Mathematics II", topics: [{ name: "Differential Equations", difficulty: "Hard", completed: false }, { name: "Vector Calculus", difficulty: "Medium", completed: false }] },
        { name: "Data Structures", topics: [{ name: "Arrays & Linked Lists", difficulty: "Easy", completed: false }, { name: "Stacks, Queues & Trees", difficulty: "Medium", completed: false }, { name: "Graphs & Sorting Algorithms", difficulty: "Hard", completed: false }] },
        { name: "Basic Electrical & Electronics", topics: [{ name: "DC & AC Circuit Analysis", difficulty: "Medium", completed: false }, { name: "Semiconductor Diodes & Transistors", difficulty: "Easy", completed: false }] }
      ],
      3: [
        { name: "Discrete Mathematics", topics: [{ name: "Set Theory & Mathematical Logic", difficulty: "Easy", completed: false }, { name: "Graph Theory & Trees", difficulty: "Hard", completed: false }, { name: "Combinatorics & Recurrence", difficulty: "Medium", completed: false }] },
        { name: "Digital Logic Design", topics: [{ name: "Boolean Algebra & Gates", difficulty: "Easy", completed: false }, { name: "Combinational & Sequential Circuits", difficulty: "Medium", completed: false }] },
        { name: "Object Oriented Programming", topics: [{ name: "Classes, Objects & Constructors", difficulty: "Easy", completed: false }, { name: "Inheritance, Polymorphism & Templates", difficulty: "Medium", completed: false }, { name: "File Handling & Exception Handling", difficulty: "Medium", completed: false }] }
      ],
      4: [
        { name: "Design & Analysis of Algorithms", topics: [{ name: "Asymptotic Notations & Complexity", difficulty: "Medium", completed: false }, { name: "Divide and Conquer, Greedy Approach", difficulty: "Medium", completed: false }, { name: "Dynamic Programming & NP-Completeness", difficulty: "Hard", completed: false }] },
        { name: "Operating Systems", topics: [{ name: "Process & CPU Scheduling", difficulty: "Medium", completed: false }, { name: "Memory Management & Paging", difficulty: "Hard", completed: false }, { name: "Deadlocks & File Systems", difficulty: "Medium", completed: false }] },
        { name: "Database Management Systems", topics: [{ name: "ER Modeling & Normalization", difficulty: "Medium", completed: false }, { name: "SQL Queries & Transactions", difficulty: "Medium", completed: false }, { name: "Indexing & Hashing", difficulty: "Easy", completed: false }] }
      ],
      5: [
        { name: "Theory of Computation", topics: [{ name: "Finite Automata & Regular Expressions", difficulty: "Medium", completed: false }, { name: "Context Free Grammars & Pushdown Automata", difficulty: "Hard", completed: false }, { name: "Turing Machines & Undecidability", difficulty: "Hard", completed: false }] },
        { name: "Computer Networks", topics: [{ name: "OSI & TCP/IP Reference Models", difficulty: "Easy", completed: false }, { name: "Routing Algorithms & IP Addressing", difficulty: "Hard", completed: false }, { name: "Transport Layer Protocols (TCP/UDP)", difficulty: "Medium", completed: false }] },
        { name: "Software Engineering", topics: [{ name: "Software Development Life Cycle (SDLC)", difficulty: "Easy", completed: false }, { name: "System Design & Testing Methodologies", difficulty: "Medium", completed: false }] }
      ],
      6: [
        { name: "Compiler Design", topics: [{ name: "Lexical & Syntax Analysis (Parsing)", difficulty: "Hard", completed: false }, { name: "Syntax Directed Translation & Intermediate Code", difficulty: "Hard", completed: false }, { name: "Code Optimization & Generation", difficulty: "Medium", completed: false }] },
        { name: "Artificial Intelligence", topics: [{ name: "Search Algorithms (A*, DFS/BFS)", difficulty: "Medium", completed: false }, { name: "Knowledge Representation & Inference", difficulty: "Hard", completed: false }] },
        { name: "Computer Graphics", topics: [{ name: "Scan Conversion & Line Drawing", difficulty: "Medium", completed: false }, { name: "2D & 3D Transformations", difficulty: "Hard", completed: false }] }
      ],
      7: [
        { name: "Cryptography & Security", topics: [{ name: "Symmetric & Asymmetric Encryption", difficulty: "Hard", completed: false }, { name: "Hash Functions & Digital Signatures", difficulty: "Medium", completed: false }] },
        { name: "Cloud Computing", topics: [{ name: "Virtualization & Hypervisors", difficulty: "Medium", completed: false }, { name: "SaaS, PaaS, IaaS Cloud Services", difficulty: "Easy", completed: false }] }
      ],
      8: [
        { name: "Professional Ethics", topics: [{ name: "Engineering Codes of Conduct", difficulty: "Easy", completed: false }, { name: "Intellectual Property Rights (IPR)", difficulty: "Easy", completed: false }] },
        { name: "Distributed Systems", topics: [{ name: "Message Passing & RPC", difficulty: "Medium", completed: false }, { name: "Concurrency Control & Consensus", difficulty: "Hard", completed: false }] }
      ]
    }
  },
  "ece": {
    name: "Electronics & Communication Engineering",
    semesters: {
      1: [
        { name: "Engineering Mathematics I", topics: [{ name: "Calculus & Infinite Series", difficulty: "Medium", completed: false }, { name: "Linear Algebra & Matrices", difficulty: "Medium", completed: false }] },
        { name: "Engineering Physics", topics: [{ name: "Quantum Mechanics Basics", difficulty: "Hard", completed: false }, { name: "Fiber Optics & Lasers", difficulty: "Easy", completed: false }] }
      ],
      2: [
        { name: "Engineering Mathematics II", topics: [{ name: "Differential Equations", difficulty: "Hard", completed: false }, { name: "Vector Calculus", difficulty: "Medium", completed: false }] },
        { name: "Engineering Chemistry", topics: [{ name: "Electrochemistry & Corrosion", difficulty: "Easy", completed: false }] }
      ],
      3: [
        { name: "Electronic Devices", topics: [{ name: "Semiconductor Physics", difficulty: "Medium", completed: false }, { name: "BJTs and MOSFETs Operation", difficulty: "Hard", completed: false }] },
        { name: "Network Theory", topics: [{ name: "Kirchhoff's Laws & Network Theorems", difficulty: "Medium", completed: false }, { name: "Transient and AC Analysis", difficulty: "Hard", completed: false }] }
      ],
      4: [
        { name: "Analog Circuits", topics: [{ name: "Amplifier Models & Feedback", difficulty: "Hard", completed: false }, { name: "Operational Amplifiers (Op-Amps)", difficulty: "Medium", completed: false }] },
        { name: "Microprocessors", topics: [{ name: "8085/8086 Architecture", difficulty: "Medium", completed: false }, { name: "Assembly Programming & Interfacing", difficulty: "Hard", completed: false }] }
      ],
      5: [
        { name: "Digital Signal Processing", topics: [{ name: "Discrete Fourier Transform (DFT)", difficulty: "Hard", completed: false }, { name: "IIR & FIR Filter Design", difficulty: "Hard", completed: false }] },
        { name: "Analog Communication", topics: [{ name: "Amplitude & Frequency Modulation", difficulty: "Medium", completed: false }, { name: "Noise in Communication Systems", difficulty: "Hard", completed: false }] }
      ],
      6: [
        { name: "Digital Communication", topics: [{ name: "Pulse Code Modulation (PCM)", difficulty: "Medium", completed: false }, { name: "Digital Modulation Schemes (ASK/FSK/PSK)", difficulty: "Hard", completed: false }] },
        { name: "Antennas & Wave Propagation", topics: [{ name: "Radiation Patterns & Hertzian Dipole", difficulty: "Hard", completed: false }] }
      ],
      7: [
        { name: "VLSI Design", topics: [{ name: "CMOS Inverter Transfer Characteristics", difficulty: "Hard", completed: false }, { name: "VLSI Fabrication Technology", difficulty: "Medium", completed: false }] }
      ],
      8: [
        { name: "Wireless Communication", topics: [{ name: "Cellular Concepts & Handover", difficulty: "Medium", completed: false }] }
      ]
    }
  },
  "eee": {
    name: "Electrical & Electronics Engineering",
    semesters: {
      1: [
        { name: "Engineering Mathematics I", topics: [{ name: "Calculus & Infinite Series", difficulty: "Medium", completed: false }] }
      ],
      2: [
        { name: "Engineering Mathematics II", topics: [{ name: "Differential Equations", difficulty: "Hard", completed: false }] }
      ],
      3: [
        { name: "Electromagnetic Fields", topics: [{ name: "Electrostatics & Magnetostatics", difficulty: "Hard", completed: false }, { name: "Maxwell's Equations", difficulty: "Hard", completed: false }] },
        { name: "Electrical Machines I", topics: [{ name: "DC Generators & Motors", difficulty: "Medium", completed: false }, { name: "Transformers Working Principles", difficulty: "Hard", completed: false }] }
      ],
      4: [
        { name: "Electrical Machines II", topics: [{ name: "Induction Motors Analysis", difficulty: "Hard", completed: false }, { name: "Synchronous Machines & Alternators", difficulty: "Hard", completed: false }] },
        { name: "Control Systems", topics: [{ name: "Mathematical Modeling & Transfer Functions", difficulty: "Medium", completed: false }, { name: "Time & Frequency Domain Analysis", difficulty: "Hard", completed: false }] }
      ],
      5: [
        { name: "Power Systems I", topics: [{ name: "Transmission Line Parameters", difficulty: "Medium", completed: false }, { name: "Insulators & Corona Effects", difficulty: "Medium", completed: false }] }
      ],
      6: [
        { name: "Power Systems II", topics: [{ name: "Load Flow Analysis", difficulty: "Hard", completed: false }, { name: "Symmetrical & Unsymmetrical Faults", difficulty: "Hard", completed: false }] }
      ],
      7: [
        { name: "Power Electronics", topics: [{ name: "Thyristor Characteristics & Rectifiers", difficulty: "Hard", completed: false }] }
      ],
      8: [
        { name: "Utilization of Electrical Energy", topics: [{ name: "Electric Traction & Illumination", difficulty: "Medium", completed: false }] }
      ]
    }
  },
  "me": {
    name: "Mechanical Engineering",
    semesters: {
      1: [
        { name: "Engineering Mathematics I", topics: [{ name: "Calculus & Algebra", difficulty: "Medium", completed: false }] }
      ],
      2: [
        { name: "Engineering Mathematics II", topics: [{ name: "Differential Equations", difficulty: "Hard", completed: false }] }
      ],
      3: [
        { name: "Thermodynamics", topics: [{ name: "Laws of Thermodynamics", difficulty: "Medium", completed: false }, { name: "Entropy and Exergy", difficulty: "Hard", completed: false }] },
        { name: "Strength of Materials", topics: [{ name: "Stress, Strain & Deformation", difficulty: "Medium", completed: false }, { name: "Shear Force & Bending Moments", difficulty: "Hard", completed: false }] }
      ],
      4: [
        { name: "Applied Thermodynamics", topics: [{ name: "Gas Power & Steam Cycles", difficulty: "Hard", completed: false }, { name: "Refrigeration & Air Conditioning", difficulty: "Medium", completed: false }] },
        { name: "Fluid Mechanics", topics: [{ name: "Fluid Statics & Kinematics", difficulty: "Medium", completed: false }, { name: "Bernoulli's & Navier-Stokes Equations", difficulty: "Hard", completed: false }] }
      ],
      5: [
        { name: "Heat & Mass Transfer", topics: [{ name: "Conduction & Convection Equations", difficulty: "Hard", completed: false }] }
      ],
      6: [
        { name: "Design of Machine Elements", topics: [{ name: "Design Against Static and Fluctuating Loads", difficulty: "Hard", completed: false }] }
      ],
      7: [
        { name: "CAD/CAM", topics: [{ name: "Computer Aided Design & CNC Programming", difficulty: "Medium", completed: false }] }
      ],
      8: [
        { name: "Industrial Engineering", topics: [{ name: "Operations Research & Forecasting", difficulty: "Medium", completed: false }] }
      ]
    }
  },
  "ce": {
    name: "Civil Engineering",
    semesters: {
      1: [
        { name: "Engineering Mathematics I", topics: [{ name: "Calculus & Infinite Series", difficulty: "Medium", completed: false }] }
      ],
      2: [
        { name: "Engineering Mathematics II", topics: [{ name: "Differential Equations", difficulty: "Hard", completed: false }] }
      ],
      3: [
        { name: "Strength of Materials", topics: [{ name: "Tension, Compression & Shear", difficulty: "Medium", completed: false }, { name: "Bending & Torsional Stresses", difficulty: "Hard", completed: false }] },
        { name: "Fluid Mechanics", topics: [{ name: "Properties of Fluids", difficulty: "Easy", completed: false }, { name: "Flow Through Pipes & Open Channels", difficulty: "Hard", completed: false }] }
      ],
      4: [
        { name: "Structural Analysis", topics: [{ name: "Deflection of Beams & Frames", difficulty: "Hard", completed: false }, { name: "Energy Theorems & Indeterminate Structures", difficulty: "Hard", completed: false }] },
        { name: "Soil Mechanics", topics: [{ name: "Soil Classification & Index Properties", difficulty: "Medium", completed: false }, { name: "Permeability, Consolidation & Shear Strength", difficulty: "Hard", completed: false }] }
      ],
      5: [
        { name: "Design of Concrete Structures", topics: [{ name: "Limit State Method of Design", difficulty: "Hard", completed: false }] }
      ],
      6: [
        { name: "Environmental Engineering", topics: [{ name: "Water Treatment & Sewage Design", difficulty: "Medium", completed: false }] }
      ],
      7: [
        { name: "Transportation Engineering", topics: [{ name: "Highway & Railway Geometric Design", difficulty: "Medium", completed: false }] }
      ],
      8: [
        { name: "Construction Management", topics: [{ name: "PERT & CPM Network Analysis", difficulty: "Medium", completed: false }] }
      ]
    }
  }
};

const DEFAULT_MOTIVATIONAL_QUOTES = [
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "The only place where success comes before work is in the dictionary. - Vidal Sassoon",
  "Strive for progress, not perfection. - Unknown",
  "Your talent determines what you can do. Your motivation determines how much you are willing to do. Your attitude determines how well you do it. - Lou Holtz",
  "The secret of getting ahead is getting started. - Mark Twain",
  "You don't have to be great to start, but you have to start to be great. - Zig Ziglar",
  "Success is the sum of small efforts, repeated day in and day out. - Robert Collier",
  "It always seems impossible until it's done. - Nelson Mandela",
  "Focus on your goal. Don't look in any direction but ahead."
];

const DEFAULT_STUDY_TIPS = [
  {
    title: "Space your study sessions",
    text: "Reviewing a topic 1 day, 3 days, and 7 days after first learning it (spaced repetition) dramatically increases long-term retention compared to cramming."
  },
  {
    title: "The Feynman Technique",
    text: "Try explaining a difficult concept in simple terms to a mock audience. If you stumble, go back to your notes. This exposes gaps in your understanding."
  },
  {
    title: "Active Recall beats Passive Reading",
    text: "Instead of just rereading highlights, close the book and write down everything you remember, or quiz yourself with flashcards."
  },
  {
    title: "Prioritize Hard Subjects First",
    text: "Your cognitive load is freshest at the start of your study block. Tackle complex 'Hard' topics early in the day, saving light tasks for when you are tired."
  },
  {
    title: "Interleave Your Topics",
    text: "Mix up subjects instead of studying one thing all day. Study Physics for 2 hours, then rotate to Maths. This builds stronger neural connections."
  },
  {
    title: "Take Strategic Breaks",
    text: "Use the Pomodoro method: study for 25-50 minutes, then take a mandatory 5-10 minute physical break. Stand up, stretch, hydrate!"
  }
];

// Dynamically generate 11 years of Previous Year Papers (2015-2025) for major exams
const DEFAULT_PAPERS = (() => {
  const exams = ['jee', 'neet', 'gate', 'upsc', 'cds', 'nda', 'tgc', 'lawyer', 'govt_eng'];
  const titles = {
    jee: "JEE Main & Advanced - Physics, Chemistry & Mathematics",
    neet: "NEET UG - Physics, Chemistry & Biology Solved Paper",
    gate: "GATE CS - Computer Science Solved Exam Paper",
    upsc: "UPSC Civil Services Prelims - General Studies Paper I",
    cds: "CDS Entrance Exam - English, General Knowledge & Elementary Mathematics",
    nda: "NDA & NA Entrance Exam - Mathematics & General Ability Test",
    tgc: "TGC Engineering Officer Entry - Technical & Military Aptitude",
    lawyer: "CLAT (Common Law Admission Test) - Solved Question Paper",
    govt_eng: "ESE / IES Engineering Services Exam - General Studies & Technical Specialization"
  };
  const list = [];
  
  exams.forEach(ex => {
    for (let yr = 2025; yr >= 2015; yr--) {
      list.push({
        id: `p_${ex}_${yr}`,
        exam: ex,
        title: `${yr} ${titles[ex]}`,
        year: yr,
        size: `${(1.2 + (yr % 4) * 0.7).toFixed(1)} MB`,
        downloads: Math.floor(1000 + (yr % 5) * 620 + (yr % 3) * 190),
        fileUrl: "#",
        isDummy: true
      });
    }
  });
  return list;
})();

// Local Storage Helper Utilities
const StorageManager = {
  PREFIX: "ai_study_planner_",

  save(key, val) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(val));
      return true;
    } catch (e) {
      console.error("LocalStorage save error: ", e);
      return false;
    }
  },

  load(key, defaultValue = null) {
    try {
      const stored = localStorage.getItem(this.PREFIX + key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.error("LocalStorage load error: ", e);
      return defaultValue;
    }
  },

  clear() {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (e) {
      return false;
    }
  }
};

// User Authentication Manager
const UserManager = {
  getUsers() {
    return StorageManager.load("users", [
      { name: "Demo Student", email: "demo@study.com", password: "password123" }
    ]);
  },

  register(name, email, password) {
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: "Email is already registered!" };
    }
    users.push({ name, email, password });
    StorageManager.save("users", users);
    return { success: true };
  },

  authenticate(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      StorageManager.save("current_user", { name: user.name, email: user.email });
      return { success: true, user };
    }
    return { success: false, message: "Invalid email or password." };
  },

  getCurrentUser() {
    return StorageManager.load("current_user", null);
  },

  logout() {
    localStorage.removeItem(StorageManager.PREFIX + "current_user");
  }
};

window.StorageManager = StorageManager;
window.UserManager = UserManager;
