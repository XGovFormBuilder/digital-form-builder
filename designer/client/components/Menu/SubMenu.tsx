import React, { useContext, useRef } from "react";
import { DataContext } from "../../context";
import { useMigration } from "./useMigration";

type Props = {
  id?: string;
  updateDownloadedAt?: (string) => void;
};

export function SubMenu({ id, updateDownloadedAt }: Props) {
  const { data, save } = useContext(DataContext);
  const fileInput = useRef<HTMLInputElement>(null);

  const onClickUpload = () => {
    fileInput.current!.click();
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
      <button className="govuk-link" onClick={onClickUpload}>
        Import saved form
      </button>
      <a onClick={onClickDownload} href="#">
        Download form
      </a>
      <input ref={fileInput} type="file" onChange={onFileUpload} />
    </div>
  );
}
