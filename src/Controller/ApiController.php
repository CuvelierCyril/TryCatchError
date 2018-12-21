<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\User;
use App\Entity\Subject;
use App\Entity\Answer;
use \DateTime;
use App\Service\Recaptcha;

/**
 * @route("/api/")
 */
class ApiController extends AbstractController{

    /**
     * @route("register/", name="apiRegister", methods="POST")
     */
    public function apiRegister(Request $request, Recaptcha $recaptcha, \Swift_Mailer $mailer){
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
            if(!$recaptcha->recaptcha_valid($request->request->get('g-recaptcha-response'), $request->server->get('REMOTE_ADDR'))){
                $msg['recaptcha'] = true;
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
                        $id = $newUser->getId();
                        $mail = (new \Swift_Message('Sujet du mail'))
                            ->setFrom('malac.company@gmail.fr')
                            ->setTo($email)
                            ->setBody(
                                $this->renderView('email/email-register.html.twig', array('token' => $token, 'id' => $id)),
                                'text/html'
                            )
                            ->addPart(
                                $this->renderView('email/email-register.txt.twig', array('token' => $token, 'id' => $id)),
                                'text/plain'
                            )
                        ;

                $mailer->send($mail);
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
                        if ($user->getActive() == 0){
                            $msg['notActive'] = true;
                        } else {
                            $this->get('session')->set('account', $user);
                            $msg['rank'] = $user->getRank();
                            $msg['success'] = true;
                        }
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
            $description = $request->request->get('description');
            $content = $request->request->get('content');
            $categories = $request->request->get('categories');
            $categories = explode(",", $categories);

            $languages = ['html', 'php', 'css', 'js', 'jquery', 'symfony', 'bootstrap', 'mySql'];

            if (!preg_match('#^[a-zA-Z0-9 \'\-_ !,.?:/]{5,100}$#', $title)){
                $msg['title'] = true;
            }
            if (!preg_match('#^[a-zA-Z0-9 \'\-_ !,.?:/]{5,100}$#', $description)){
                $msg['description'] = true;
            }
            if (mb_strlen($content) < 5 || mb_strlen($content) > 10000){
                $msg['content'] = true;
            }
            if($categories[0] != ""){
                dump('cat pas vide');
                foreach($categories as $category){
                    if(!in_array($category, $languages)){
                        $msg['category'] = true;
                    }
                }
                $categories = implode(" ", $categories);
            } else {
                $categories = '';
            }
            if (!isset($msg)){
                $content = strip_tags($content);
                $newSubject = new Subject();
                $newSubject
                    ->setTitle($title)
                    ->setContent($content)
                    ->setDescription($description)
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
        $languages = ['symfony', 'php', 'ajax', 'js','html','css','phppoo','jquery'];
        $filter = $request->request->get('filter');
        $filters = explode('&', $filter);
        $page = $filters[0];
        if (isset($filters[1])){
            if(in_array($filters[1], $languages)){
                $lang = $filters[1];
            } else {
                $msg['nan'] = true;
            }
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
                    'cat' => explode(' ',$subject->getCategories()),
                    'desc' => $subject->getDescription()
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

    /**
     * @route("admin/change-status", name="apiAdminStatus")
     */
    public function apiAdmin(Request $request){
        if ($request->getMethod() == "POST"){
            $datastr = $request->request->get('datastr');
            $data = explode("/", $datastr);
            $repo = $this->getDoctrine()->getRepository(User::class);
            $user = $repo->findOneById($data[0]);
            if ($user != null){
                $user->setStatus($data[1]);
                $em = $this->getDoctrine()->getManager();
                $em->merge($user);
                $em->flush();
                $msg['success'] = true;
            } else {
                $msg['noUser'] = true;
            }
        } else {
            $msg['failed'] = true;
        }
        return $this->json($msg);
    }
}