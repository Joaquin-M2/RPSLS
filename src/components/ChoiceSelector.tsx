import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

type ChoiceSelectorProps = {
  id: string;
  playerChoice: number;
  fieldIsDisabled: boolean;
  onChangeSelect: (event: SelectChangeEvent<number>) => void;
};

function ChoiceSelector({
  id,
  playerChoice,
  fieldIsDisabled,
  onChangeSelect,
}: ChoiceSelectorProps) {
  return (
    <FormControl fullWidth sx={{ marginBottom: "5rem" }}>
      <InputLabel id={id}>Select your choice</InputLabel>
      <Select
        labelId={id}
        id={id}
        value={playerChoice}
        label="Select your choice"
        disabled={fieldIsDisabled}
        onChange={onChangeSelect}
        sx={{ width: "100%" }}
      >
        <MenuItem value={0} sx={{ display: "none" }}></MenuItem>
        <MenuItem value={1}>Rock</MenuItem>
        <MenuItem value={2}>Paper</MenuItem>
        <MenuItem value={3}>Scissors</MenuItem>
        <MenuItem value={4}>Spock</MenuItem>
        <MenuItem value={5}>Lizard</MenuItem>
      </Select>
    </FormControl>
  );
}

export default ChoiceSelector;
