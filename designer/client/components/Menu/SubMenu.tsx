import React, { useContext } from "react";
import { DataContext } from "../../context";
import { useMigration } from "./useMigration";

type Props = {
  id?: string;
  updateDownloadedAt?: (string) => void;
};

export function SubMenu({ id, updateDownloadedAt }: Props) {
  const { data, save } = useContext(DataContext);
  const onClickUpload = (e) => {
    e.preventDefault();
    document.getElementById("upload").click();
  };

  const onClickDownload = (e) => {
    e.preventDefault();
    const encodedData =
      "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    updateDownloadedAt?.(new Date().toLocaleTimeString());
    const link = document.createElement("a");
    link.download = `${id}.json`;
    link.href = `data:${encodedData}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onFileUpload = (e) => {
    const file = e.target.files.item(0);
    const reader = new window.FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (evt) {
      const content = JSON.parse(evt.target.result);
      const migrated = useMigration(content);
      console.log(migrated);
      save(content);
    };
  };

  return (
    <div className="menu__row">
      <a href="/app">Create new form</a>
      <a href="#" onClick={onClickUpload}>
        Import saved form
      </a>
      <a onClick={onClickDownload} href="#">
        Download form
      </a>
      <input type="file" id="upload" hidden onChange={onFileUpload} />
    </div>
  );
}
