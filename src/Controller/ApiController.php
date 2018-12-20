<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\User;
use App\Entity\Subject;
use App\Entity\Answer;
use \DateTime;

/**
 * @route("/api/")
 */
class ApiController extends AbstractController{

    /**
     * @route("register/", name="apiRegister", methods="POST")
     */
    public function apiRegister(Request $request){
        if ($request->getMethod() == 'POST'){
            $email = $request->request->get('email');
            $nickname = $request->request->get('nickname');
            $password = $request->request->get('password');
            $passwordConfirm = $request->request->get('passwordConfirm');

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)){
                $msg['email'] = true;
            }
            if (!preg_match('#^[a-zA-Z0-9áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ._-]{3,50}$#', $nickname)){
                $msg['nickname'] = true;
            }
            if (!preg_match('#^.{3,100}$#', $password)){
                $msg['password'] = true;
            }
            if ($password != $passwordConfirm){
                $msg['passwordConfirm'] = true;
            }

            if (!isset($msg)){
                $repo = $this->getDoctrine()->getRepository(User::class);
                $user = $repo->findOneByEmail($email);
                if ($user == null){
                    $user = $repo->findOneByNickname($nickname);
                    if ($user == null){
                        $token = md5(rand().uniqid().time());
                        $newUser = new User();
                        $newUser
                            ->setEmail($email)
                            ->setPassword(password_hash($password, PASSWORD_BCRYPT))
                            ->setNickname($nickname)
                            ->setScore(0)
                            ->setToken($token)
                            ->setActive(0)
                            ->setPicture('img/default.png')
                            ->setDate(new Datetime())
                            ->setRank(0)
                            ->setStatus(0)
                        ;
                        $em = $this->getDoctrine()->getManager();
                        $em->persist($newUser);
                        $em->flush();
                        $msg['success'] = true;
                    } else {
                        $msg['nicknameExists'] = true;
                    }
                } else {
                    $msg['emailExists'] = true;
                }
            }
        }
        return $this->json($msg);
    }

    /**
     * @route("login/", name="apiLogin", methods="POST")
     */
    public function apiLogin(Request $request){
        if ($request->getMethod() == 'POST'){
            $email = $request->request->get('email');
            $password = $request->request->get('password');

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)){
                $msg['email'] = true;
            }
            if (!preg_match('#^.{3,100}$#', $password)){
                $msg['password'] = true;
            }
            if (!isset($msg)){
                $repo = $this->getDoctrine()->getRepository(User::class);
                $user = $repo->findOneByEmail($email);
                if ($user != null){
                    if (password_verify($password, $user->getPassword())){
                        $this->get('session')->set('account', $user);
                        $msg['success'] = true;
                    } else {
                        $msg['passwordInvalid'] = true;
                    }
                } else {
                    $msg['emailDoesntExist'] = true;
                }
            }
        }
        return $this->json($msg);
    }
    /**
     * @route("create-subject/", name="apiCreateSubject", methods="POST")
     */
    public function apiCreateSubject(Request $request){
        if ($request->getMethod() == 'POST'){
            $title = $request->request->get('title');
            $content = $request->request->get('content');
            $categories = $request->request->get('categories');

            $languages = ['php', 'symfony', 'css', 'js', 'sql', 'html', 'phppoo', 'angular'];

            if (!preg_match('#^[a-zA-Z0-9 \'\-_ !,.?:/]{5,100}$#', $title)){
                $msg['title'] = true;
            }
            if (!preg_match('#^[a-zA-Z0-9 \'\-_ !,.?:/]{5,10000}$#', $content)){
                $msg['content'] = true;
            }
            if($categories != null){
                foreach($categories as $category){
                    if(!in_array($category, $languages)){
                        $msg['category'] = true;
                    }
                }
            } else {
                $categories = '';
            }
            
            dump($categories);

            if (!isset($msg)){
                $categories = implode(' ', $categories);
                $newSubject = new Subject();
                $newSubject
                    ->setTitle($title)
                    ->setContent($content)
                    ->setCategories($categories)
                    ->setView(0)
                    ->setDate(new DateTime())
                    ->setAuthor($this->get('session')->get('account'))
                ;
                $em = $this->getDoctrine()->getManager();
                $em->merge($newSubject);
                $em->flush();
                $msg['success'] = true;
            }
        }
        return $this->json($msg);
    }

    /**
     * @route("create-answer/", name="apiCreateAnswer", methods="POST")
     */
    public function apiCreateAnswer(Request $request){
        if ($request->getMethod() == "POST"){
            $content = $request->request->get('content');
            $id = $request->request->get('subjectId');

            if (!preg_match('#^[a-zA-Z0-9 \'\-_ !,.?:/]{5,10000}$#', $content)){
                $msg['content'] = true;
            }
            if (!preg_match('#^[0-9]+$#', $id)){
                $msg['id'] = true;
            }

            if (!isset($msg)){
                $repo = $this->getDoctrine()->getRepository(Subject::class);
                $subject = $repo->findOneById($id);
                $newAnswer = new Answer();
                $newAnswer
                    ->setContent($content)
                    ->setDate(new DateTime())
                    ->setVerified(0)
                    ->setAuthor($this->get('session')->get('account'))
                    ->setSubject($subject)
                ;
                $em = $this->getDoctrine()->getManager();
                $em->merge($newAnswer);
                $em->flush();
                $msg['success'] = true;
            }
        }
        return $this->json($msg);
    }

    /**
     * @route("delete-subject", name="apiDeleteSubject", methods="POST")
     */
    public function apiDeleteSubject(Request $request){
        $id = $request->request->get('subjectId');

        $repo = $this->getDoctrine()->getRepository(Subject::class);
        $subject = $repo->findOneById($id);
        if ($subject != null){
            $answers = $subject->getAnswers();
            $em = $this->getDoctrine()->getManager();
            foreach ($answers as $answer){
                $em->remove($answer);
            }
            $em->remove($subject);
            $em->flush();
            $msg['success'] = true;
        } else {
            $msg['subjectDoesntExist'] = true;
        }
        return $this->json($msg);
    }

    /**
     * @route("delete-answer/", name="apiDeleteAnswer", methods="POST")
     */
    public function apiDeleteAnswer(Request $request){
        $id = $request->request->get('answerId');

        $repo = $this->getDoctrine()->getRepository(Answer::class);
        $answer = $repo->findOneById($id);
        if ($answer != null){
            $em = $this->getDoctrine()->getManager();
            $em->remove($answer);
            $em->flush();
            $msg['success'] = true;
        } else {
            $msg['AnswerDoesntExist'] = true;
        }
        return $this->json($msg);
    }

    /**
     * @route("verified-answer/", name="apiVerifiedAnswer", methods="POST")
     */
    public function apiVerifiedAnswer(Request $request){
        $idSubject = $request->request->get('subjectId');
        $idAnswer = $request->request->get('answerId');

        $repo = $this->getDoctrine()->getRepository(Subject::class);
        $subject = $repo->findOneById($idSubject);
        if ($subject != null){
            $answers = $subject->getAnswers();
            foreach ($answers as $answer){
                if ($answer->getVerified() == 1){
                    $msg['alreadyVerified'] = true;
                }
            }
            if (!isset($msg['alreadyVerified'])){
                $repo = $this->getDoctrine()->getRepository(Answer::class);
                $answer = $repo->findOneById($idAnswer);
                $answer->setVerified(1);
                $em = $this->getDoctrine()->getManager();
                $em->merge($answer);
                $em->flush();
                $msg['success'] = true;
            }
        } else {
            $msg['AnswerDoesntExist'] = true;
        }
        return $this->json($msg);
    }

    /**
     * @route("list-subjects/", name="apiSubjects", methods="POST")
     */
    public function apiSubjects(Request $request){
        $filter = $request->request->get('filter');
        $filters = explode('&', $filter);
        $page = $filters[0];
        if (isset($filters[1])){
            $lang = $filters[1];
        } else {
            $lang = '';
        }
        if (!is_numeric($page)){
            $msg['nan'] = true;
        }
        if (!isset($msg)){
            $repo = $this->getDoctrine()->getRepository(Subject::class);
            $subjects = $repo->findAllDateDesc(10 * (intval($page) - 1), '%'.$lang.'%');
            foreach($subjects as $subject){
                $newarray[] = array(
                    'title' => $subject->getTitle(),
                    'content' => $subject->getContent(),
                    'id' => $subject->getId(),
                    'cat' => explode(' ',$subject->getCategories())
                );
            }
            $newarray[] = $repo->findCount(0, '%'.$lang.'%')[0][1];
            $newarray[] = ceil($repo->findCount(0, '%'.$lang.'%')[0][1] / 10);
            $newarray[] = $request->request->get('page');
            return $this->json($newarray);
        } else {
            return $this->json($msg);
        }
    }
}