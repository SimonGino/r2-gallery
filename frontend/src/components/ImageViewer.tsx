import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Download from "yet-another-react-lightbox/plugins/download";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import type { R2Object } from "../types";
import { formatSize } from "../utils/format";

interface ImageViewerProps {
  images: R2Object[];
  currentIndex: number;
  onClose: () => void;
}

const ImageViewer = ({ images, currentIndex, onClose }: ImageViewerProps) => {
  // Convert R2Object to Lightbox slides format
  const slides = images.map((img) => ({
    src: img.url,
    alt: img.key,
    title: img.key.split("/").pop() || img.key,
    description: `${img.width || "?"}×${img.height || "?"} - ${formatSize(img.size)}`,
    download: img.url,
    width: img.width,
    height: img.height,
  }));

  return (
    <Lightbox
      open={currentIndex >= 0}
      close={onClose}
      index={currentIndex}
      slides={slides}
      plugins={[Zoom, Download, Captions]}
      zoom={{
        scrollToZoom: true,
        maxZoomPixelRatio: 5,
        zoomInMultiplier: 2,
        doubleTapDelay: 300,
        doubleClickDelay: 300,
        doubleClickMaxStops: 2,
        keyboardMoveDistance: 50,
        wheelZoomDistanceFactor: 100,
        pinchZoomDistanceFactor: 100,
      }}
      carousel={{
        finite: false,
        preload: 2,
      }}
      controller={{
        closeOnBackdropClick: true,
      }}
      // Enable keyboard navigation (arrow keys)
      on={{
        view: ({ index }) => {
          console.log("Viewing image:", index);
        },
      }}
    />
  );
};

export default ImageViewer;
