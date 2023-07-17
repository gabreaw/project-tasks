<?php

namespace Ixcsoft\MindupManager\Services;

use Ixcsoft\MindupManager\Repository\DatabaseManager;
use PDO;
use RuntimeException;

class AdminService
{
    private $databaseManager;

    public function __construct(DatabaseManager $databaseManager)
    {
        $this->databaseManager = $databaseManager;
    }

    public function createColumn($name)
    {
        if (empty($name)) {
            throw new RuntimeException('Parâmetro name faltando.');
        }

        return $this->databaseManager->insertColumn($name);
    }

}
