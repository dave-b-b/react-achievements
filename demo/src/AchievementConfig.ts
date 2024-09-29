import levelUpIcon from "./assets/achievements/grapes.svg";

const achievementConfig = {
  level: [
    {
      check: (value) => value >= 10,
      data: {
        id: "level_10",
        title: "Novice Adventurer",
        description: "Reached level 10",
        icon: levelUpIcon,
      },
    },
    {
      check: (value) => value >= 50,
      data: {
        id: "level_50",
        title: "Seasoned Warrior",
        description: "Reached level 50",
        icon: levelUpIcon,
      },
    },
  ],
};

export default achievementConfig;
