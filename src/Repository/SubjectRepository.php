<?php

namespace App\Repository;

use App\Entity\Subject;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method Subject|null find($id, $lockMode = null, $lockVersion = null)
 * @method Subject|null findOneBy(array $criteria, array $orderBy = null)
 * @method Subject[]    findAll()
 * @method Subject[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SubjectRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, Subject::class);
    }

    public function findAllDateDesc($offset, $like){
        return $this->createQueryBuilder('s')
        ->andWhere('s.categories LIKE :key')
        ->setParameter('key', $like)
        ->orderBy('s.date', 'DESC')
        ->setMaxResults(10)
        ->setFirstResult($offset)
        ->getQuery()
        ->getResult()
        ;
    }

    public function findByKeyWord($keyword){
        return $this->createQueryBuilder('s')
        ->andWhere('s.title LIKE :key')
        ->setParameter('key', $keyword)
        ->orderBy('s.date', 'DESC')
        ->getQuery()
        ->getResult()
        ;
    }

    public function findByKeyWordLimited($keyword){
        return $this->createQueryBuilder('s')
        ->andWhere('s.title LIKE :key')
        ->setParameter('key', $keyword)
        ->orderBy('s.date', 'DESC')
        ->setMaxResults(3)
        ->getQuery()
        ->getResult()
        ;
    }

    public function findCount($offset, $like){
        return $this->createQueryBuilder('s')
        ->select('COUNT(s.id)')
        ->andWhere('s.categories LIKE :key')
        ->setParameter('key', $like)
        ->orderBy('s.date', 'DESC')
        ->getQuery()
        ->getResult()
        ;
    }

    public function lastFiveWithId($id){
        return $this->createQueryBuilder('s')
        ->andWhere('s.author = :key')
        ->setParameter('key', $id)
        ->orderBy('s.date', 'DESC')
        ->setMaxResults(5)
        ->getQuery()
        ->getResult()
        ;
    }

    public function lastFive(){
        return $this->createQueryBuilder('s')
        ->orderBy('s.date', 'DESC')
        ->setMaxResults(5)
        ->getQuery()
        ->getResult()
        ;
    }

    // /**
    //  * @return Subject[] Returns an array of Subject objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('s.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Subject
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
