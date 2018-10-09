// Overlay text for the stream
const safeStrings = require('./safeStrings');

const getOverlayTextString = async (path, config, typeKey, metadata) => {
  // Create our overlay
  // Note: Positions and sizes are done relative to the input video width and height
  // Therefore position x/y is a percentage, like CSS style.
  // Font size is simply just a fraction of the width
  let overlayTextFilterString = '';
  if (config[typeKey].overlay && config[typeKey].overlay.enabled) {
    const overlayConfigObject = config[typeKey].overlay;
    const overlayTextItems = [];

    const fontPath = `${path}${overlayConfigObject.font_path}`;

    // Check if we have a title option
    if (overlayConfigObject.title && overlayConfigObject.title.enabled) {
      const itemObject = overlayConfigObject.title;
      const safeText = safeStrings.forFilter( itemObject.text );
      let itemString =
        `drawtext=text='${safeText}'` +
        `:fontfile=${fontPath}` +
        `:fontsize=(w * ${itemObject.font_size / 300})` +
        `:bordercolor=${itemObject.font_border}` +
        `:borderw=1` +
        `:fontcolor=${itemObject.font_color}` +
        `:y=(h * ${itemObject.position_y / 100})`;
      if (itemObject.enable_scroll) {
        itemString += `:x=w-mod(max(t\\, 0) * (w + tw) / ${itemObject.font_scroll_speed}\\, (w + tw))`;
      } else {
        itemString += `:x=(w * ${itemObject.position_x / 100})`;
      }
      overlayTextItems.push(itemString);
    }

    // Check if we have an artist option
    if (overlayConfigObject.artist && overlayConfigObject.artist.enabled) {
      const itemObject = overlayConfigObject.artist;
      const safeText = safeStrings.forFilter( itemObject.label .  metadata.common.artist);
      let itemString =
        `drawtext=text='${safeText}'` +
        `:fontfile=${fontPath}` +
        `:fontsize=(w * ${itemObject.font_size / 300})` +
        `:bordercolor=${itemObject.font_border}` +
        `:borderw=1` +
        `:fontcolor=${itemObject.font_color}` +
        `:y=(h * ${itemObject.position_y / 100})` +
        `:x=(w * ${itemObject.position_x / 100})`;
      overlayTextItems.push(itemString);
    }

    // Check if we have an album option
    if (overlayConfigObject.album && overlayConfigObject.album.enabled) {
      const itemObject = overlayConfigObject.album;
      const safeText = safeStrings.forFilter( itemObject.label .  metadata.common.album);
      let itemString =
        `drawtext=text='${safeText}'` +
        `:fontfile=${fontPath}` +
        `:fontsize=(w * ${itemObject.font_size / 300})` +
        `:bordercolor=${itemObject.font_border}` +
        `:borderw=1` +
        `:fontcolor=${itemObject.font_color}` +
        `:y=(h * ${itemObject.position_y / 100})` +
        `:x=(w * ${itemObject.position_x / 100})`;
      overlayTextItems.push(itemString);
    }

    // Check if we have an artist option
    if (overlayConfigObject.song && overlayConfigObject.song.enabled) {
      const itemObject = overlayConfigObject.song;
      const safeText = safeStrings.forFilter( itemObject.label .  metadata.common.title);
      let itemString =
        `drawtext=text='${safeText}'` +
        `:fontfile=${fontPath}` +
        `:fontsize=(w * ${itemObject.font_size / 300})` +
        `:bordercolor=${itemObject.font_border}` +
        `:borderw=1` +
        `:fontcolor=${itemObject.font_color}` +
        `:y=(h * ${itemObject.position_y / 100})` +
        `:x=(w * ${itemObject.position_x / 100})`;
      overlayTextItems.push(itemString);
    }

    // Add our video filter with all of our overlays
    overlayTextItems.forEach((item, index) => {
      overlayTextFilterString += `${item}`;
      if (index < overlayTextItems.length - 1) {
        overlayTextFilterString += ',';
      }
    });
  }

  // Return the filter string
  return overlayTextFilterString;
};

module.exports = getOverlayTextString;
