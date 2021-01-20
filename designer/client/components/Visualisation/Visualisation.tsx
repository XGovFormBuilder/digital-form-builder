import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import Page from "../../page";
import { Lines } from "./Lines";
import { Minimap } from "./Minimap";
import { Info } from "./Info";
import { getLayout, Pos } from "./getLayout";
import "./visualisation.scss";
import { DataContext } from "../../context";
import { i18n } from "../../i18n";

type Props = {
  updatedAt?: string;
  downloadedAt?: string;
  previewUrl?: string;
  persona?: any;
};

export function useVisualisation(ref) {
  const { data } = useContext(DataContext);
  const [layout, setLayout] = useState<Pos>();
  const [pushedHistoryCount, setPushedHistoryCount] = useState(-1);

  useEffect(() => {
    const layout = getLayout(data, ref.current!);
    setLayout(layout.pos);
  }, [data]);

  function pushEmptyState() {
    window.history.pushState(document.title, window.location.pathname);
    setPushedHistoryCount((prevState) => prevState + 1);
  }

  useLayoutEffect(() => {
    pushEmptyState();
  }, []);

  const alertUser = () => {
    if (window.confirm(i18n("leaveDesigner"))) {
      window.history.go(-pushedHistoryCount - 1);
    } else {
      pushEmptyState();
    }
  };

  useEffect(() => {
    window.addEventListener("popstate", alertUser);
    return () => {
      window.removeEventListener("popstate", alertUser);
    };
  }, []);

  return { layout };
}

export function Visualisation(props: Props) {
  const ref = useRef(null);
  const { layout } = useVisualisation(ref);
  const { data } = useContext(DataContext);

  const { updatedAt, downloadedAt, previewUrl, persona } = props;
  const { pages } = data;

  const wrapperStyle = layout && {
    width: layout?.width,
    height: layout?.height,
  };

  return (
    <div className="visualisation">
      <div className="visualisation__pages-wrapper">
        <div ref={ref} style={wrapperStyle}>
          {pages.map((page, index) => (
            <Page
              key={index}
              page={page}
              persona={persona}
              previewUrl={previewUrl}
              layout={layout?.nodes[index]}
            />
          ))}

          {layout && <Lines layout={layout} data={data} persona={persona} />}
        </div>
      </div>

      {layout && <Info downloadedAt={downloadedAt} updatedAt={updatedAt} />}

      {layout && <Minimap layout={layout} />}
    </div>
  );
}
