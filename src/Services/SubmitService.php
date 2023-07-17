<?php

namespace Ixcsoft\MindupManager\Services;

use Ixcsoft\MindupManager\Repository\DatabaseManager;
use PDO;
use RuntimeException;

class SubmitService
{
    private $databaseManager;

    public function __construct(DatabaseManager $databaseManager)
    {
        $this->databaseManager = $databaseManager;
    }

    public function createTask($title, $description)
    {
        if (empty($title) || empty($description)) {
            throw new RuntimeException('Preencha os campos corretamente!');
        }

        return $this->databaseManager->insertTask($title, $description);
    }

}
