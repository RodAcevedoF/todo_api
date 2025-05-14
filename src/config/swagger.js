import YAML from "yamljs";
import path from "path";

const swaggerDocument = YAML.load(path.resolve("src/docs/swagger.yaml"));

export default swaggerDocument;
