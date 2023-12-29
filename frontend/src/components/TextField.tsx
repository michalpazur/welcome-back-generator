import { KeyboardArrowDownRounded as ArrowDown } from "@mui/icons-material"
import {
  SelectProps,
  TextField as MuiTextField,
  TextFieldProps,
} from "@mui/material";
import React, { useId } from "react";

const TextField: React.FC<TextFieldProps> = ({
  SelectProps,
  children,
  id,
  ...props
}) => {
  const randomId = useId();
  const labelId = useId();
  const inputId = id || randomId;

  const overwriteSelectProps: SelectProps = {
    ...SelectProps,
    IconComponent: ArrowDown,
    inputProps: {
      id: inputId,
    },
    labelId,
  };

  return (
    <MuiTextField
      id={props.select ? undefined : inputId}
      SelectProps={overwriteSelectProps}
      {...props}
    >
      {children}
    </MuiTextField>
  );
};

export default TextField;
