import React, { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDataById } from "./store/dataSlice";
import { getData } from "./store/dataSelectors";
import "./index.scss";

function Designer(): ReactElement {
  const dispatch = useDispatch();
  const { id, data, loaded } = useSelector(getData);
  useEffect(() => {
    dispatch(fetchDataById(id));
  }, [id]);

  if (!loaded) return <div> Loading ...</div>;
  return <div>data loaded -{JSON.stringify(data)} </div>;
}

export default Designer;
