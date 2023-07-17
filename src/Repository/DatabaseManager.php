<?php
namespace Ixcsoft\MindupManager\Repository;

use PDO;
use RuntimeException;

class DatabaseManager
{
    private $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function insertColumn($name)
    {
        $sql = "INSERT INTO columns(name) VALUES (:name)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindValue(':name', $name);
        $result = $stmt->execute();

        if (!$result) {
            throw new RuntimeException('Erro ao inserir a ideia no banco de dados');
        }
        return true;
    }
    public function insertTask($title, $description)
    {
        $sql = "INSERT INTO tasks (title, description, created_at, column_task_id) VALUES (?, ?,  DATETIME('now'), 1)";
        $stmt = $this->pdo->prepare($sql);

        $result = $stmt->execute([$title, $description]);

        if (!$result) {
            throw new RuntimeException('Erro ao inserir a tarefa no banco de dados');
        }

        return true;
    }
}
