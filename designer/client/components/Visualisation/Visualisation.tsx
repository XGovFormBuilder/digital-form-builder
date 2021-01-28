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
import { Prompt } from "react-router-dom";

type Props = {
  updatedAt?: string;
  downloadedAt?: string;
  previewUrl?: string;
  persona?: any;
  id?: string;
};

export function useVisualisation(ref) {
  const { data } = useContext(DataContext);
  const [layout, setLayout] = useState<Pos>();

  useEffect(() => {
    const layout = getLayout(data, ref.current!);
    setLayout(layout.pos);
  }, [data]);

  return { layout };
}

export function Visualisation(props: Props) {
  const ref = useRef(null);
  const { layout } = useVisualisation(ref);
  const { data } = useContext(DataContext);

  const { updatedAt, downloadedAt, previewUrl, persona, id } = props;
  const { pages } = data;

  const wrapperStyle = layout && {
    width: layout?.width,
    height: layout?.height,
  };

  return (
    <>
      <Prompt message={i18n("leaveDesigner")} />
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
                id={id}
              />
            ))}

            {layout && <Lines layout={layout} data={data} persona={persona} />}
          </div>
        </div>

        {layout && <Info downloadedAt={downloadedAt} updatedAt={updatedAt} />}

        {layout && <Minimap layout={layout} />}
      </div>
    </>
  );
}
