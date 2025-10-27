/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { FilterParams } from '@/services/db/_lib/filtering';
import type {
  SQLParameter,
  NonArrayFilterValue,
} from '@/services/db/admin/type/parameter';
import { convertValue } from './convert-value';

type BuildFilterConfig = {
  columnMappings: Record<string, string>;
  defaultWhere: string;
  aggregatedColumns?: string[];
  numericColumns?: string[];
  dateColumns?: string[];
  uuidColumns?: string[];
  enumColumns?: string[];
  initialParameters?: SQLParameter[];
};

export const buildFilterClauses = (
  filters: FilterParams['filters'] | undefined,
  config: BuildFilterConfig
): {
  whereClause: string;
  havingClause: string;
  parameters: SQLParameter[];
} => {
  const {
    columnMappings,
    defaultWhere,
    aggregatedColumns = [],
    numericColumns = [],
    dateColumns = [],
    uuidColumns = [],
    enumColumns = [],
    initialParameters = [],
  } = config;

  let whereClause = defaultWhere;
  let havingClause = '';
  const parameters: SQLParameter[] = [...initialParameters];

  if (!filters || filters.length === 0) {
    return { whereClause, havingClause, parameters };
  }

  const whereConditions: string[] = [];
  const havingConditions: string[] = [];

  filters.forEach(filter => {
    const sqlColumn = columnMappings[filter.column];
    if (!sqlColumn) {
      throw new Error(`Invalid filter column: ${filter.column}`);
    }

    const paramIndex = parameters.length + 1;
    let condition = '';
    const isDateColumn = dateColumns.includes(filter.column);
    const isUuidColumn = uuidColumns.includes(filter.column);
    const isEnumColumn = enumColumns.includes(filter.column);

    // For text-based operators on enum columns, cast to text
    const columnForTextOp = isEnumColumn ? `${sqlColumn}::text` : sqlColumn;

    switch (filter.operator) {
      case 'equals':
        condition = isDateColumn
          ? `${sqlColumn} = $${paramIndex}::timestamp`
          : isUuidColumn
            ? `${sqlColumn} = $${paramIndex}::uuid`
            : `${sqlColumn} = $${paramIndex}`;
        parameters.push(
          convertValue(
            filter.value as NonArrayFilterValue,
            filter.column,
            numericColumns
          )
        );
        break;
      case 'not_equals':
        condition = isDateColumn
          ? `${sqlColumn} != $${paramIndex}::timestamp`
          : isUuidColumn
            ? `${sqlColumn} != $${paramIndex}::uuid`
            : `${sqlColumn} != $${paramIndex}`;
        parameters.push(
          convertValue(
            filter.value as NonArrayFilterValue,
            filter.column,
            numericColumns
          )
        );
        break;
      case 'contains':
        condition = `${columnForTextOp} ILIKE $${paramIndex}`;
        parameters.push(`%${filter.value}%`);
        break;
      case 'not_contains':
        condition = `${columnForTextOp} NOT ILIKE $${paramIndex}`;
        parameters.push(`%${filter.value}%`);
        break;
      case 'starts_with':
        condition = `${columnForTextOp} ILIKE $${paramIndex}`;
        parameters.push(`${filter.value}%`);
        break;
      case 'ends_with':
        condition = `${columnForTextOp} ILIKE $${paramIndex}`;
        parameters.push(`%${filter.value}`);
        break;
      case 'greater_than':
        condition = isDateColumn
          ? `${sqlColumn} > $${paramIndex}::timestamp`
          : `${sqlColumn} > $${paramIndex}`;
        parameters.push(
          convertValue(
            filter.value as NonArrayFilterValue,
            filter.column,
            numericColumns
          )
        );
        break;
      case 'less_than':
        condition = isDateColumn
          ? `${sqlColumn} < $${paramIndex}::timestamp`
          : `${sqlColumn} < $${paramIndex}`;
        parameters.push(
          convertValue(
            filter.value as NonArrayFilterValue,
            filter.column,
            numericColumns
          )
        );
        break;
      case 'greater_than_or_equal':
        condition = isDateColumn
          ? `${sqlColumn} >= $${paramIndex}::timestamp`
          : `${sqlColumn} >= $${paramIndex}`;
        parameters.push(
          convertValue(
            filter.value as NonArrayFilterValue,
            filter.column,
            numericColumns
          )
        );
        break;
      case 'less_than_or_equal':
        condition = isDateColumn
          ? `${sqlColumn} <= $${paramIndex}::timestamp`
          : `${sqlColumn} <= $${paramIndex}`;
        parameters.push(
          convertValue(
            filter.value as NonArrayFilterValue,
            filter.column,
            numericColumns
          )
        );
        break;
      case 'in':
        if (Array.isArray(filter.value)) {
          const placeholders = filter.value
            .map((_, i) =>
              isUuidColumn ? `$${paramIndex + i}::uuid` : `$${paramIndex + i}`
            )
            .join(', ');
          condition = `${sqlColumn} IN (${placeholders})`;
          parameters.push(
            ...filter.value.map(v =>
              convertValue(
                v as NonArrayFilterValue,
                filter.column,
                numericColumns
              )
            )
          );
        }
        break;
      case 'not_in':
        if (Array.isArray(filter.value)) {
          const placeholders = filter.value
            .map((_, i) =>
              isUuidColumn ? `$${paramIndex + i}::uuid` : `$${paramIndex + i}`
            )
            .join(', ');
          condition = `${sqlColumn} NOT IN (${placeholders})`;
          parameters.push(
            ...filter.value.map(v =>
              convertValue(
                v as NonArrayFilterValue,
                filter.column,
                numericColumns
              )
            )
          );
        }
        break;
      case 'is_null':
        condition = `${sqlColumn} IS NULL`;
        break;
      case 'is_not_null':
        condition = `${sqlColumn} IS NOT NULL`;
        break;
      default:
        throw new Error(`Unsupported filter operator: ${filter.operator}`);
    }

    if (condition) {
      if (aggregatedColumns.includes(filter.column)) {
        havingConditions.push(condition);
      } else {
        whereConditions.push(condition);
      }
    }
  });

  if (whereConditions.length > 0) {
    whereClause += ` AND (${whereConditions.join(' AND ')})`;
  }

  if (havingConditions.length > 0) {
    havingClause = `HAVING ${havingConditions.join(' AND ')}`;
  }

  return { whereClause, havingClause, parameters };
};
