import React, { useState, useEffect } from "react";
import { Card, Typography, Tag, Button, Row, Col, Tooltip, Flex, message } from "antd";
import { PlayCircleOutlined, DeleteOutlined, StopOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const { Text } = Typography;

const formatDuration = (totalSeconds) => {
    const dur = dayjs.duration(totalSeconds, 'seconds');
    return [
        Math.floor(dur.asHours()).toString().padStart(2, "0"),
        dur.minutes().toString().padStart(2, "0"),
        dur.seconds().toString().padStart(2, "0"),
    ].join(":");
};

const TaskList = ({ tasks = [], onRefresh }) => {
    const [activeEntryId, setActiveEntryId] = useState(null);
    const [liveDuration, setLiveDuration] = useState(null);

    useEffect(() => {
        const activeEntry = tasks.find(entry => !entry.end_time);

        if (activeEntry && activeEntry.id !== activeEntryId) {
            setActiveEntryId(activeEntry.id);
        } else if (!activeEntry && activeEntryId) {
            setActiveEntryId(null);
        }

        let timer = null;
        if (activeEntry) {
            // Χρησιμοποιούμε το current_start_time για την τρέχουσα συνεδρία
            const startMoment = dayjs(activeEntry.current_start_time);
            const initialDuration = activeEntry.duration || 0;
            timer = setInterval(() => {
                const now = dayjs();
                const diffSeconds = now.diff(startMoment, 'seconds');
                setLiveDuration(initialDuration + diffSeconds);
            }, 1000);
        } else {
            setLiveDuration(null);
        }

        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [tasks, activeEntryId]);

    const handleRestart = async (task, projectId) => {
        try {
            await axios.post(
                "http://localhost:8000/api/time/start",
                {
                    task_id: task,
                    project_id: projectId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("apiToken")}`,
                    },
                }
            );
            onRefresh?.();
            message.success("Task restarted successfully!");
        } catch (error) {
            console.error("Failed to restart task:", error);
            message.error("Failed to restart task.");
        }
    };

    const handleStop = async () => {
        try {
            await axios.post(
                "http://localhost:8000/api/time/stop",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("apiToken")}`,
                    },
                }
            );
            onRefresh?.();
            message.success("Timer stopped successfully!");
        } catch (error) {
            console.error("Failed to stop timer:", error);
            message.error("Failed to stop timer.");
        }
    };

    const handleDelete = async (entryId) => {
        try {
            await axios.delete(
                `http://localhost:8000/api/time/entries/${entryId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("apiToken")}`,
                    },
                }
            );
            onRefresh?.();
            message.success("Time entry deleted successfully!");
        } catch (error) {
            console.error("Failed to delete time entry:", error);
            message.error("Failed to delete time entry.");
        }
    };

    // Εδώ μπορείς να κάνεις τον υπολογισμό του εβδομαδιαίου συνόλου δυναμικά αν θέλεις
    const weeklyTotal = "00:01:23";

    const filteredTasks = tasks.filter(
        (entry) =>
            entry.task?.status !== "auto" && entry.task?.title !== "Add description"
    );

    return (
        <Card
            style={{ marginTop: 20, boxShadow: "none", border: "1px solid #f0f0f0" }}
            bodyStyle={{ padding: 0 }}
        >
            <Flex
                justify="space-between"
                align="center"
                style={{ padding: "12px 16px", backgroundColor: "#fafafa" }}
            >
                <Text strong>This week</Text>
                <Text>
                    <Text type="secondary" style={{ marginRight: 8 }}>
                        Week total
                    </Text>
                    <Text strong>{weeklyTotal}</Text>
                </Text>
            </Flex>

            <div style={{ padding: 0 }}>
                {filteredTasks.length === 0 ? (
                    <div style={{ padding: "12px 16px" }}>
                        <Text type="secondary">No tasks found.</Text>
                    </div>
                ) : (
                    filteredTasks.map((entry) => (
                        <div
                            key={entry.id}
                            style={{
                                padding: "12px 16px",
                                borderBottom: "1px solid #f0f0f0",
                                backgroundColor: entry.id === activeEntryId ? "#e6f7ff" : "white",
                            }}
                        >
                            <Row gutter={8} align="middle" wrap={false}>
                                <Col flex="auto">
                                    <Flex align="center">
                                        <Text strong style={{ marginRight: 8 }}>
                                            {entry.task?.title || "No title"}
                                        </Text>
                                        <Tag
                                            color="blue"
                                            style={{
                                                marginRight: 8,
                                                background: "rgba(0, 0, 0, 0.04)",
                                                color: "rgba(0, 0, 0, 0.88)",
                                                border: "1px solid #d9d9d9",
                                            }}
                                        >
                                            {entry.project?.name || "Project"}
                                        </Tag>
                                    </Flex>
                                </Col>
                                <Col flex="200px">
                                    <Flex justify="flex-end" align="center" gap={8}>
                                        <Text type="secondary" style={{ whiteSpace: "nowrap" }}>
                                            {entry.start_time ? dayjs(entry.start_time).format("HH:mm") : "..."}
                                        </Text>
                                        <Text>-</Text>
                                        <Text type="secondary" style={{ whiteSpace: "nowrap" }}>
                                            {entry.end_time ? dayjs(entry.end_time).format("HH:mm") : "..."}
                                        </Text>

                                        <Text style={{ whiteSpace: "nowrap", minWidth: "70px", textAlign: "right" }}>
                                            {entry.id === activeEntryId
                                                ? formatDuration(liveDuration)
                                                : formatDuration(entry.duration)}
                                        </Text>

                                        {entry.id === activeEntryId ? (
                                            <Tooltip title="Stop timer">
                                                <Button
                                                    icon={<StopOutlined />}
                                                    shape="circle"
                                                    type="text"
                                                    size="small"
                                                    danger
                                                    onClick={handleStop}
                                                />
                                            </Tooltip>
                                        ) : (
                                            <Tooltip title="Continue timer for this activity">
                                                <Button
                                                    icon={<PlayCircleOutlined />}
                                                    shape="circle"
                                                    type="text"
                                                    size="small"
                                                    style={{ color: "#1677ff" }}
                                                    onClick={() =>
                                                        handleRestart(entry.task_id, entry.project_id)
                                                    }
                                                />
                                            </Tooltip>
                                        )}
                                        
                                        <Tooltip title="Delete Entry">
                                            <Button
                                                icon={<DeleteOutlined />}
                                                shape="circle"
                                                type="text"
                                                size="small"
                                                danger
                                                onClick={() => handleDelete(entry.id)}
                                            />
                                        </Tooltip>
                                    </Flex>
                                </Col>
                            </Row>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};

export default TaskList;