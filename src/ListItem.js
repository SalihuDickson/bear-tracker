import React from "react";
import { ComboboxOption } from "@reach/combobox";

const ListItem = ({
  coordinates,
  properties: { id, label },
  setSelectedCoordinates,
  setValue,
  setStatus,
}) => {
  return (
    <div
      key={id}
      onClick={(e) => {
        setSelectedCoordinates(coordinates);
        setValue(label);
        setStatus(0);
      }}
    >
      <ComboboxOption key={id} value={label} />
    </div>
  );
};

export default ListItem;
