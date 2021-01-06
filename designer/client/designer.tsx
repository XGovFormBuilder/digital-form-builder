import React, { ReactElement, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchDataById, updateDownloadedAt } from "./store/dataSlice";
import { getData } from "./store/dataSelectors";
import { Visualisation } from "./components/visualisation";
import Menu from "./menu";
import { Data } from "@xgovformbuilder/model";

function Designer(): ReactElement {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { data, loaded, previewUrl, downloadedAt, updatedAt } = useSelector(
    getData
  );

  useEffect(() => {
    dispatch(fetchDataById(id));
  }, [id]);

  if (!loaded) return <div> Loading ...</div>;

  const dataObject = new Data(data);

  return (
    <div id="app">
      <Menu
        data={dataObject}
        id={id}
        updateDownloadedAt={(arg) => dispatch(updateDownloadedAt(arg))}
      />
      <Visualisation
        data={dataObject}
        downloadedAt={downloadedAt}
        updatedAt={updatedAt}
        id={id}
        previewUrl={previewUrl}
      />
    </div>
  );
}

export default Designer;
