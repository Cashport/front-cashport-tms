"use client";
import { useState } from "react";
import { Flex, Spin } from "antd";

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
  const [selectedRows, setSelectedRows] = useState<ITask[] | undefined>(undefined);
  const [selectedFilters, setSelectedFilters] = useState<ISelectFilterTasks>({
    statuses: [],
    taskTypes: []
  });

  const { data, isLoading } = useTasks(selectedFilters, search);

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
            <TaskTable
              data={data}
              setSelectedRows={setSelectedRows}
            />
          )}
        </Flex>
      </Container>
    </div>
  );
};

export default TaskManagerView;
