// tsc accepts unknown keys in an imported JSON file, because excess-property
// checks only apply to fresh object literals. This walks the data against the
// PortfolioContent interface and reports keys the type does not declare.
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const TYPES_FILE = 'src/data/portfolioData.ts'
const DATA_FILE = 'src/data/portfolio-data.json'
const ROOT_TYPE = 'PortfolioContent'

const program = ts.createProgram([TYPES_FILE], {
  target: ts.ScriptTarget.ES2023,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: true,
  noEmit: true,
})
const checker = program.getTypeChecker()

const source = program.getSourceFile(TYPES_FILE)
if (!source) throw new Error(`Could not load ${TYPES_FILE}`)

const declaration = source.statements.find(
  (node) => ts.isInterfaceDeclaration(node) && node.name.text === ROOT_TYPE
)
if (!declaration) throw new Error(`Could not find interface ${ROOT_TYPE}`)

const rootType = checker.getDeclaredTypeOfSymbol(
  checker.getSymbolAtLocation(declaration.name)
)

const elementTypeOf = (type) => {
  const indexed = checker.getIndexTypeOfType(type, ts.IndexKind.Number)
  if (indexed) return indexed
  const args = checker.getTypeArguments?.(type)
  return args?.length ? args[0] : undefined
}

const propertyTypeOf = (symbol) => {
  const declared = symbol.valueDeclaration ?? symbol.declarations?.[0]
  if (!declared) return undefined
  return checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(symbol, declared))
}

const unknownKeys = []

const walk = (value, type, path) => {
  if (!type || value === null || typeof value !== 'object') return

  if (Array.isArray(value)) {
    const element = elementTypeOf(type)
    value.forEach((item, i) => walk(item, element, `${path}[${i}]`))
    return
  }

  const properties = checker.getPropertiesOfType(type)
  // A primitive or union type yields no properties; flagging every key there
  // would be noise rather than a finding.
  if (properties.length === 0) return
  if (checker.getIndexTypeOfType(type, ts.IndexKind.String)) return

  const declaredNames = new Map(properties.map((p) => [p.name, p]))
  for (const key of Object.keys(value)) {
    const property = declaredNames.get(key)
    if (!property) {
      unknownKeys.push(`${path}.${key}`)
      continue
    }
    walk(value[key], propertyTypeOf(property), `${path}.${key}`)
  }
}

walk(JSON.parse(readFileSync(DATA_FILE, 'utf8')), rootType, ROOT_TYPE)

if (unknownKeys.length > 0) {
  console.error(`${DATA_FILE}: ${unknownKeys.length} key(s) not declared on ${ROOT_TYPE}:`)
  for (const key of unknownKeys) console.error(`  ${key}`)
  process.exit(1)
}

console.log(`${DATA_FILE}: all keys match ${ROOT_TYPE}`)
