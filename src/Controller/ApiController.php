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
 * gestion de tous les formulaires ajax
 * @route("/api/")
 */
class ApiController extends AbstractController{

    /**
     * @route("register/", name="apiRegister", methods="POST")
     */
    public function apiRegister(Request $request, Recaptcha $recaptcha, \Swift_Mailer $mailer){
        if ($request->getMethod() == 'POST'){ //appel et vérification de toutes les données recues du formulaire
            $email = $request->request->get('email');
            $nickname = $request->request->get('nickname');
            $password = $request->request->get('password');
            $passwordConfirm = $request->request->get('passwordConfirm');

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)){
                $msg['email'] = true;
            }
            if (!preg_match('#^[a-z0-9áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœ._\-\']{3,50}$#i', $nickname)){
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

            if (!isset($msg)){ // si tout est bon, création du compte en bbd, envoie d'un mail d'activation
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
        if ($request->getMethod() == 'POST'){ //appel et vérification de toutes les données recues du formulaire
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
                        } else { //si l'utilisateur a un avertissement, affichage de ce dernier s'il est valide, et changement automatique d'etat s'il ne l'est pas
                            if ($user->getWaringDuration() <= strtotime("now")){
                                $user->setStatus(0);
                                $em = $this->getDoctrine()->getManager();
                                $em->merge($user);
                                $em->flush();
                            }
                            if ($user->getRank() == 2){
                                $tokenAdmin = md5(uniqid().rand().time());
                                $user->setToken($tokenAdmin);
                                $this->get('session')->set('tokenAdmin', $tokenAdmin);
                            }
                            $this->get('session')->set('account', $user);
                            $msg['rank'] = $user->getRank();
                            $msg['status'] = $user->getStatus();
                            $msg['warning'] = $user->getWarning();
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
        dump($msg);
        return $this->json($msg);
    }
    /**
     * @route("create-subject/", name="apiCreateSubject", methods="POST")
     */
    public function apiCreateSubject(Request $request){
        if ($request->getMethod() == 'POST'){ //appel et vérification de toutes les données recues du formulaire
            $title = $request->request->get('title');
            $description = $request->request->get('description');
            $content = $request->request->get('content');
            $categories = $request->request->get('categories');
            $categories = explode(",", $categories);

            $languages = ['html', 'php', 'css', 'js', 'jquery', 'symfony', 'bootstrap', 'mySql'];

            if (!preg_match('#^[a-z0-9 \'\-_ !,.?:/]{5,100}$#i', $title)){
                $msg['title'] = true;
            }
            if (!preg_match('#^[a-z0-9 \'\-_ !,.?:/]{5,100}$#i', $description)){
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
            if (!isset($msg)){ // si tout est bon création du sujet en bdd
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
        if ($request->getMethod() == "POST"){ //appel et vérification de toutes les données recues du formulaire
            $content = $request->request->get('content');
            $id = $request->request->get('subjectId');

            if (mb_strlen($content) < 5 || mb_strlen($content) > 10000){
                $msg['content'] = true;
            }
            if (!preg_match('#^[0-9]+$#', $id)){
                $msg['id'] = true;
            }

            if (!isset($msg)){ // si tout est bon création de la réponse en bdd
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
     * @route("delete-subject/", name="apiDeleteSubject", methods="POST")
     */
    public function apiDeleteSubject(Request $request){ //supression d'un sujet et de toutes les réponses de ce sujet
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
    public function apiDeleteAnswer(Request $request){ // suppression d'une réponse d'un article
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
    public function apiVerifiedAnswer(Request $request){ // validation d'une réponse d'un sujet
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
     * @route("annulate-answer/", name="apiAnnulateAnswer", methods="POST")
     */
    public function apiAnnulateAnswer(Request $request){ //annulation de la validation d'une reponse
        $idAnswer = $request->request->get('answerId');

        $repo = $this->getDoctrine()->getRepository(Answer::class);
        $answer = $repo->findOneById($idAnswer);
        $answer->setVerified(0);
        $em = $this->getDoctrine()->getManager();
        $em->merge($answer);
        $em->flush();
        $msg['success'] = true;
        return $this->json($msg);
    }

    /**
     * @route("list-subjects/", name="apiSubjects", methods="POST")
     */
    public function apiSubjects(Request $request){ //gestion en ajax de l'affichage et de la pagination de la liste des sujets
        $languages = ['symfony', 'php', 'bootstrap', 'js','html','css','mySql','jquery'];
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
                    'desc' => $subject->getDescription(),
                    'view' => $subject->getView(),
                    'answer' => count($subject->getAnswers())
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
        if ($request->getMethod() == "POST"){ // changement de status et ajout d'un avertissement
            $datastr = $request->request->get('datastr');
            dump($datastr);
            $data = explode("/", $datastr);
            $message = $request->request->get('message');
            $duration = $request->request->get('duration');

            if(preg_match('/^[a-záàâäãåçéèêëíìîïñóòôöõúùûüýÿæœ0-9\s\'\"]{3,255}$/i', $message) || $data[1] == 0){
                $repo = $this->getDoctrine()->getRepository(User::class);
                $user = $repo->findOneById($data[0]);
                if ($user != null){
                    $user->setStatus($data[1]);
                    $user->setWarning($message);
                    $user->setWaringDuration(intval(strtotime("now")) + intval($duration));
                    $em = $this->getDoctrine()->getManager();
                    $em->merge($user);
                    $em->flush();
                    $msg['success'] = true;
                } else {
                    $msg['noUser'] = true;
                }
            } else {
                $msg['reason'] = true;
            }

        } else {
            $msg['failed'] = true;
        }
        return $this->json($msg);
    }

    /**
     * @route("sendMail", name="apiSendMail")
     */
    public function apiSendMail(\Swift_Mailer $mailer, Request $request){ //fonction d'envoi de mail lors de la création de compte
        $email = $request->request->get('email');
        $repo = $this->getDoctrine()->getRepository(User::class);
        $user = $repo->findOneByEmail($email);
        if ($user != null){
            $id = $user->getId();
            $token = md5(uniqid().rand().time());
            $user->setToken($token);
            $em = $this->getDoctrine()->getManager();
            $em->merge($user);
            $em->flush();
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
            $msg['noEmail'] = true;
        }
        return $this->json($msg);
    }

    /**
     * @route("resetPasswordMail", name="apiResetPasswordMail")
     */
    public function apiResetPasswordMail(Request $request, \Swift_Mailer $mailer){ //envoie de mail lors du reset de mot de passe si l'email est correct
        $email = $request->request->get('emailReset');
        $repo = $this->getDoctrine()->getRepository(User::class);
        $user = $repo->findOneByEmail($email);
        if ($user == null){
            $msg['noUser'] = true;
        } else {
            $token = md5(rand().uniqid().time());
            $user->setToken($token);
            $em = $this->getDoctrine()->getManager();
            $em->merge($user);
            $em->flush();
            $id = $user->getId();
            $mail = (new \Swift_Message('Sujet du mail'))
                ->setFrom('malac.company@gmail.fr')
                ->setTo($email)
                ->setBody(
                    $this->renderView('email/email-resetPassword.html.twig', array('token' => $token, 'id' => $id)),
                    'text/html'
                )
                ->addPart(
                    $this->renderView('email/email-resetPassword.txt.twig', array('token' => $token, 'id' => $id)),
                    'text/plain'
                )
            ;

            $mailer->send($mail);
            $msg['success'] = true;
        }
        return $this->json($msg);
    }

    /**
     * @route("resetPassword", name="apiResetPassword")
     */
    public function apiResetPassword(Request $request){ //changement de mot de passe depuis le formulaire 'mot de passe oublié'
        $newPass = $request->request->get('new-pass');
        $passConf = $request->request->get('confirm-pass');
        $id = $request->request->get('id');
        $repo = $this->getDoctrine()->getRepository(User::class);
        $user = $repo->findOneById($id);
        if (password_verify($newPass, $user->getPassword())){
            $msg['passwordSameCurrent'] = true;
        } else {
            if (!preg_match("#^.{3,500}$#", $newPass)){
                $msg['passIncorrect'] = true;
            } else {
                if ($newPass != $passConf){
                    $msg['passDiff'] = true;
                }
            }
        }
        if (!isset($msg)){
            $user->setPassword(password_hash($newPass, PASSWORD_BCRYPT));
            $em = $this->getDoctrine()->getManager();
            $em->merge($user);
            $em->flush();
            $msg['success'] = true;
        }
        return $this->json($msg);
    }
    /**
     * @route("PasswordChange", name="apiPasswordChange")
     */
    public function apiPasswordChange(Request $request){ //changement de mot de passe depuis la page profil
        $AccountPassword = $this->get('session')->get('account')->getPassword();
        $NewPass = $request->request->get('NewPass');
        $newpass2 = $request->request->get('NewPass2');
        $currentPass = $request->request->get('CurrentPass');

        if($request->getMethod() == 'POST'){ //appel et vérification de toutes les données recues du formulaire
            if($currentPass == "" || $NewPass == "" || $newpass2 == ""){
                $msg['emptypassword'] = true;
            } else {
                if(password_verify($currentPass, $AccountPassword)){
                    if($NewPass != $currentPass){
                        if(preg_match("#^.{5,500}$#", $NewPass)){
                            if($NewPass == $newpass2){
                                $repo = $this->getDoctrine()->getRepository(User::class);
    
                                $this->get('session')->get('account')->setPassword(password_hash($newpass2, PASSWORD_BCRYPT));
                                $em = $this->getDoctrine()->getManager();
                                $em->merge($this->get('session')->get('account'));
                                $em->flush();
                                $msg['success'] = true;
                            } else {
                                $msg['newpass'] = true;
                            }
                        } else {
                            $msg['newPassPregMatch'] = true;
                        }
                    } else {
                        $msg['CurrentPass'] = true;
                    }
                } else {
                    $msg['passwordhash'] = true;
                }
            }
            
        }
        return $this->json($msg);
    }
    /**
     * @route("NameChange", name="apiNameChange")
     */
    public function apiNameChange(Request $request){ //changement de pseudo

        $oldName = $this->get('session')->get('account')->getNickname();
        $newName = $request->request->get('Nickname');

        if($request->getMethod() == 'POST'){ //appel et vérification de toutes les données recues du formulaire
            if($newName == ""){
                $msg['emptyNickName'] = true;
            } else {
                if($newName != $oldName){
                    if(preg_match('#^.{3,100}$#', $newName)){
                        $repo = $this->getDoctrine()->getRepository(User::class);
            
                        $this->get('session')->get('account')->setNickname($newName);
                        $em = $this->getDoctrine()->getManager();
                        $em->merge($this->get('session')->get('account'));
                        $em->flush();
                        $msg['success'] = true;
                    } else {
                        $msg['pregmatchNickName'] = true;
                    }
                } else {
                    $msg['sameNickName'] = true;
                }
            }

        }
        return $this->json($msg);
    }
}