import Space from "./space.jsx";
import Stickies from "./stickies.jsx";
import * as Icons from "../icons.jsx";
import * as Utils from "../../utils";
import * as Yabai from "../../yabai";
import * as Settings from "../../settings";

export { spacesStyles as styles } from "../../styles/components/spaces/spaces";

const settings = Settings.get();
const { spacesDisplay, process } = settings;
const {
  displayStickyWindowsSeparately,
  spacesExclusions,
  exclusionsAsRegex,
  hideCreateSpaceButton,
  showOnDisplay,
} = spacesDisplay;

export const Component = ({ spaces, windows, SIP, displayIndex }) => {
  const visible = Utils.isVisibleOnDisplay(displayIndex, showOnDisplay);
  const isProcessVisible = Utils.isVisibleOnDisplay(
    displayIndex,
    process.showOnDisplay
  );

  if (!visible) return null;

  if (!spaces && !windows) {
    return <div className="spaces spaces--empty" />;
  }

  const displays = [...new Set(spaces.map((space) => space.display))];
  const SIPDisabled = SIP !== "System Integrity Protection status: enabled.";

  const { index: currentSpaceIndex } = spaces.find((space) => {
    const { "has-focus": hasFocus, focused: __legacyHasFocus } = space;
    return hasFocus ?? __legacyHasFocus;
  });

  return displays.map((display, i) => {
    if (display !== displayIndex) return null;

    const onClick = async (e) => {
      Utils.clickEffect(e);
      await Yabai.createSpace(displayIndex);
    };

    return (
      <div key={i} className="spaces">
        {displayStickyWindowsSeparately && (
          <Stickies display={display} windows={windows} />
        )}
        {spaces.map((space, i) => {
          const { label, index } = space;
          const lastOfSpace =
            i !== 0 && space.display !== spaces[i - 1].display;

          const key = label?.length ? label : index;
          const isExcluded = Utils.isSpaceExcluded(
            key,
            spacesExclusions,
            exclusionsAsRegex
          );

          if (isExcluded) return null;

          return (
            <Space
              key={key}
              display={display}
              space={space}
              windows={windows}
              displayIndex={displayIndex}
              currentSpaceIndex={currentSpaceIndex}
              SIPDisabled={SIPDisabled}
              lastOfSpace={lastOfSpace}
            />
          );
        })}
        {SIPDisabled && !hideCreateSpaceButton ? (
          <button className="spaces__add" onClick={onClick}>
            <Icons.Add />
          </button>
        ) : (
          isProcessVisible && <div className="spaces__end-separator" />
        )}
      </div>
    );
  });
};
