export const OUTLINE_TEMPLATES = [
  {
    id: "three-point",
    name: "3-Point Expository",
    description:
      "Three main points unpacking the passage, each with room for explanation and application.",
    points: [
      {
        heading: "Point 1",
        children: [{ heading: "Explanation" }, { heading: "Application" }],
      },
      {
        heading: "Point 2",
        children: [{ heading: "Explanation" }, { heading: "Application" }],
      },
      {
        heading: "Point 3",
        children: [{ heading: "Explanation" }, { heading: "Application" }],
      },
    ],
  },
  {
    id: "narrative-arc",
    name: "Narrative Arc",
    description:
      "Follows the shape of a story: setting, tension, turning point, and what it means for us.",
    points: [
      { heading: "Setting the scene" },
      { heading: "The tension" },
      { heading: "The turning point" },
      { heading: "Resolution — what it means for us" },
    ],
  },
  {
    id: "verse-by-verse",
    name: "Verse-by-Verse",
    description: "Walk through the passage phrase by phrase — good for shorter, dense texts.",
    points: [{ heading: "Verse 1" }, { heading: "Verse 2" }, { heading: "Verse 3" }],
  },
];
