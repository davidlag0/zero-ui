import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Divider,
  Grid,
  Hidden,
  Snackbar,
  Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CodeMirror from "@uiw/react-codemirror";
import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";
import { compile } from "external/RuleCompiler";
import debounce from "lodash/debounce";
import { useState } from "react";
import API from "utils/API";

function NetworkRules({ network, callback }) {
  const [editor, setEditor] = useState(null);
  const [flowData, setFlowData] = useState({
    rules: [...network.config.rules],
    capabilities: [...network.config.capabilities],
    tags: [...network.config.tags],
  });
  const [tagCapByNameData, setTagCapByNameData] = useState({
    tagsByName: network.tagsByName || {},
    capabilitiesByName: network.capabilitiesByName || {},
  });
  const [errors, setErrors] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const saveChanges = async () => {
    if (editor) {
      const req = await API.post("/network/" + network["config"]["id"], {
        config: { ...flowData },
        rulesSource: editor.getValue(),
        ...tagCapByNameData,
      });
      console.log("Action", req);
      setSnackbarOpen(true);
      const timer = setTimeout(() => {
        setSnackbarOpen(false);
      }, 1500);

      callback();

      return () => clearTimeout(timer);
    }
  };

  const onChange = debounce((event) => {
    const src = event.getValue();
    setEditor(event);
    let rules = [],
      caps = {},
      tags = {};
    const res = compile(src, rules, caps, tags);
    if (!res) {
      let capabilitiesByName = {};
      for (var key in caps) {
        capabilitiesByName[key] = caps[key].id;
      }

      let tagsByName = { ...tags };
      for (let key in tags) {
        tags[key] = { id: tags[key].id, default: tags[key].default };
      }

      setFlowData({
        rules: [...rules],
        capabilities: [...Object.values(caps)],
        tags: [...Object.values(tags)],
      });

      setTagCapByNameData({
        tagsByName: tagsByName,
        capabilitiesByName: capabilitiesByName,
      });
      setErrors([]);
    } else {
      setErrors(res);
    }
  }, 100);

  const theme3024day = createTheme({
    theme: "light",
    settings: {
      background: "#f7f7f7",
      foreground: "#3a3432",
      caret: "#5d00ff",
      selection: "#d6d5d4",
      selectionMatch: "#036dd626",
      lineHighlight: "#e8f2ff",
      gutterBackground: "#f7f7f7",
      gutterForeground: "#8a919966",
    },
    styles: [
      { tag: t.comment, color: "#cdab53" },
      { tag: t.variableName, color: "#0080ff" },
      { tag: [t.string, t.special(t.brace)], color: "#5c6166" },
      { tag: t.number, color: "#a16a94" },
      { tag: t.bool, color: "#5c6166" },
      { tag: t.null, color: "#5c6166" },
      { tag: t.keyword, color: "#db2d20" },
      { tag: t.operator, color: "#5c6166" },
      { tag: t.className, color: "#5c6166" },
      { tag: t.definition(t.typeName), color: "#5c6166" },
      { tag: t.typeName, color: "#5c6166" },
      { tag: t.angleBracket, color: "#3a3432" },
      { tag: t.tagName, color: "#5c6166" },
      { tag: t.attributeName, color: "#01a252" },
    ],
  });

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Flow Rules</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {/*   Important note: value in CodeMirror instance means INITAIL VALUE
              or it could be used to replace editor state with the new value.
              No need to update on every user character input
        */}
        <CodeMirror
          value={network["rulesSource"]}
          onChange={onChange}
          options={{ tabSize: 2, lineWrapping: true }}
        />
        <Hidden mdDown>
          <div>
            <CodeMirror
              value={JSON.stringify(flowData, null, 2)}
              width="100%"
              height="50%"
              theme={theme3024day}
              options={{
                readOnly: true,
                lineNumbers: false,
                lineWrapping: true,
              }}
            />
          </div>
        </Hidden>
        <Divider />
        <Grid
          item
          style={{
            margin: "1%",
            display: "block",
            overflowWrap: "break-word",
            width: "250px",
          }}
        >
          {!!errors.length ? (
            <Typography color="error">
              {"[" + errors[0] + ":" + errors[1] + "] " + errors[2]}
            </Typography>
          ) : (
            <Button variant="contained" color="primary" onClick={saveChanges}>
              Save Changes
            </Button>
          )}
        </Grid>
        <Snackbar
          open={snackbarOpen}
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          message="Saved"
        />
      </AccordionDetails>
    </Accordion>
  );
}

export default NetworkRules;
