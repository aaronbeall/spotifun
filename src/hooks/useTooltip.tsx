import { ReactNode, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function useTooltip() {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const getPageCoords = (e: React.MouseEvent) => {
    return { x: e.pageX, y: e.pageY };
  };
  const show = (node: ReactNode, e: React.MouseEvent) => {
    setContent(node);
    setVisible(true);
    setPos(getPageCoords(e));
  };
  const move = (e: React.MouseEvent) => {
    setPos(getPageCoords(e));
  };
  const hide = () => setVisible(false);

  const Tooltip = visible
    ? createPortal(
        <div
          ref={ref}
          style={{
            position: 'absolute',
            left: pos.x + 12,
            top: pos.y + 12,
            zIndex: 99999,
            pointerEvents: 'none',
            background: 'rgba(30,41,59,0.98)',
            color: 'white',
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
            border: '1px solid rgba(255,255,255,0.08)',
            maxWidth: '220px',
            whiteSpace: 'pre-line',
          }}
        >
          {content}
        </div>,
        document.body
      )
    : null;

  return { Tooltip, show, move, hide };
}