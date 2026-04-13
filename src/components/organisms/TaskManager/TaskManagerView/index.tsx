"use client";
import { useEffect, useState } from "react";
import { Flex, Pagination, Spin } from "antd";

import UiSearchInput from "@/components/ui/search-input";
import Container from "@/components/atoms/Container/Container";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import TaskTable from "../TaskManagerTable";
import FiltersTasks, {
  ISelectFilterTasks
} from "@/components/atoms/Filters/FiltersTasks/FiltersTasks";

import { ITask } from "@/types/tasks/ITasks";
import { useTasks } from "@/hooks/useTasks";

const TaskManagerView = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<ITask[] | undefined>(undefined);
  const [selectedFilters, setSelectedFilters] = useState<ISelectFilterTasks>({
    statuses: [],
    taskTypes: []
  });

  useEffect(() => {
    setPage(1);
  }, [search, selectedFilters]);

  const { data, pagination, isLoading } = useTasks(selectedFilters, search, page);

  return (
    <div style={{ overflowY: "auto" }}>
      <Container>
        <Flex gap="1rem" vertical>
          <Flex gap="0.5rem">
            <UiSearchInput
              className="search"
              placeholder="Buscar tarea"
              onChange={(event) => setSearch(event.target.value)}
            />
            <FiltersTasks setSelectedFilters={setSelectedFilters} />
            <GenerateActionButton
              onClick={() => {}}
              disabled={!selectedRows || selectedRows.length === 0}
            />
          </Flex>

          {isLoading ? (
            <Flex justify="center" align="center" style={{ height: "3rem" }}>
              <Spin />
            </Flex>
          ) : (
            <TaskTable data={data} setSelectedRows={setSelectedRows} />
          )}

          {pagination && (
            <Flex justify="end" style={{ paddingBottom: "0.5rem" }}>
              <Pagination
                current={page}
                pageSize={pagination.rowsperpage}
                total={pagination.totalRows}
                onChange={(newPage) => setPage(newPage)}
                showSizeChanger={false}
              />
            </Flex>
          )}
        </Flex>
      </Container>
    </div>
  );
};

export default TaskManagerView;
