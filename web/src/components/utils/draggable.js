export default function(element, options) {
    const mousemove = function(event) {
      if (options.move) {
        options.move(event);
      }
    };
    const mousedown = function(event) {
      if (options.start) {
        options.start(event);
      }
    };
    const mouseup = function(event) {
      document.removeEventListener("mousedown", mousedown);
      document.removeEventListener("mousemove", mousemove);
      document.removeEventListener("mouseup", mouseup);
      document.onselectstart = null;
      document.ondragstart = null;
  
      if (options.end) {
        options.end(event);
      }
    };
    element.addEventListener("mousedown", event => {
      if (options.stop && options.stop(event, element) === false) {
        return false;
      }
      document.onselectstart = function() {
        return false;
      };
      document.ondragstart = function() {
        return false;
      };
      document.addEventListener("mousedown", mousedown);
      document.addEventListener("mousemove", mousemove);
      document.addEventListener("mouseup", mouseup);
    });
  }
  