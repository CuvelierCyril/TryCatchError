<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\Subject;
use App\Entity\Answer;
use App\Entity\User;

class MainController extends AbstractController{

    /**
     * @route("/", name="index")
     */
    public function index(){
        $keyWord = '';
        $repo = $this->getDoctrine()->getRepository(Subject::class);
        $lastSubjects = $repo->lastThree();

        if ($this->get('session')->has('lastResearch')){
            $search = $this->get('session')->get('lastResearch');
            $keywords = explode(" ", $search);
            $search = '%';
            foreach($keywords as $keyword){
                $search = $search.$keyword.'%';
            }
            $lastResearch = $repo->findByKeyWordLimited($search);
            $keyWord = str_replace('%', '', $search);
        }

        if ($this->get('session')->has('lastSubjects')){
            $lastId = $this->get('session')->get('lastSubjects');
            foreach($lastId as $id){
                if ($id > 0){
                    $lastThree[] = $repo->findOneById($id);
                }
            }
        }

        if (!isset($lastSubjects) || count($lastSubjects) == 0){
            $lastSubjects = null;
        }
        if (!isset($lastResearch) || count($lastResearch) == 0){
            $lastResearch = null;
        }
        if (!isset($lastThree) || count($lastThree) == 0){
            $lastThree = null;
        }
        return $this->render('index.html.twig', array('lastSubjects'=> $lastSubjects, 'lastResearch' => $lastResearch, 'keyWord' => $keyWord, 'lastThree' => $lastThree));
    }

    /**
     * @route("/inscription/", name="register")
     */
    public function register(){
        if ($this->get('session')->has('account')){
            throw new AccessDeniedHttpException();
        }
        return $this->render('register.html.twig');
    }

    /**
     * @route("/profile/", name="profil")
     */
    public function profil(Request $request){
        if (!$this->get('session')->has('account')){
            throw new AccessDeniedHttpException();
        }
        $repo = $this->getDoctrine()->getRepository(Subject::class);
        $subjects = $repo->lastThree();
        $repo = $this->getDoctrine()->getRepository(Answer::class);
        $answers = $repo->lastThree();
        if ($request->getMethod() == "POST"){
            $typeAccepted = array('image/png', 'image/jpeg', 'image/gif');
            $extensionPossible = array('png', 'jpeg', 'gif');
            $img = $request->files->get('img');

            if($img == null){
                $msg[] = "<p class='alert alert-danger'>Aucun fichier reçu</p>";
            } else {
                if($img->getError() == 1 || $img->getError() == 2 || $img->getSize() > 4000000){
                    $msg[] = "<p class='alert alert-danger'>Taille du fichier trop élevée</p>";
                }
                if($img->getError() == 3){
                    $msg[] = "<p class='alert alert-danger'>Erreur lors du traitement</p>";
                }
                if($img->getError() == 6 || $img->getError() == 7 || $img->getError() == 8){
                    $msg[] = "<p class='alert alert-danger'>Erreur serveur</p>";
                }
                if (!isset($msg)){
                    $user = $this->get('session')->get('account');
                    if (in_array($img->getMimeType(), $typeAccepted)){
                        $extension = $extensionPossible[array_keys($typeAccepted, $img->getMimeType())[0]];
                        $fileName = $user->getId().'-profil.'.$extension;
                        move_uploaded_file($img->getPathname(), '../public/img/'.$fileName);
                        $user->setPicture('img/'.$fileName);
                        $em = $this->getDoctrine()->getManager();
                        $em->merge($user);
                        $em->flush();
                        $msg[] = "<p class='alert alert-success'>Votre image à bien été changer</p>";
                    }
                }
            }
            return $this->render('profil.html.twig', array('msg' => $msg, 'subjects' => $subjects, 'answers' => $answers));
        }
        return $this->render('profil.html.twig', array('subjects' => $subjects, 'answers' => $answers));        
    }
    /**
     * @route("/se-connecter/", name="login")
     */
    public function login(){
        if ($this->get('session')->has('account')){
            throw new AccessDeniedHttpException();
        }
        return $this->render('login.html.twig');
    }
    /**
     * @route("/liste-sujets/", name="subjects")
     */
    public function subjects(){
            return $this->render('subjects-list.html.twig');
    }

    /**
     * @route("/sujet/{id}", name="subject", requirements={"id" = "[\d]+"})
     */
    public function subject($id, Request $request){
        $repo = $this->getDoctrine()->getRepository(Subject::class);
        $article = $repo->findOneById($id);
        $repo = $this->getDoctrine()->getRepository(Answer::class);
        $answers = $repo->findBySubject($article, array("date" => "DESC"));
        if ($article == null){
            return $this->render('subject.html.twig', array('vide' => true));
        }
        $article->setView($article->getView() + 1);
        $em = $this->getDoctrine()->getManager();
        $em->merge($article);
        $em->flush();
        $content = $article->getContent();
        $content = str_replace('[overline]', '<span style="text-decoration: line-through;">', $content);
        $content = str_replace('[/overline]', '</span>', $content);
        $content = str_replace('[underline]', '<span style="text-decoration : underline;">', $content);
        $content = str_replace('[/underline]', '</span>', $content);
        $content = str_replace('[mark]', '<mark>', $content);
        $content = str_replace('[/mark]', '</mark>', $content);
        $content = str_replace('[error]', '<span style="color: red; font-weight: bold; background-color: white;">', $content);
        $content = str_replace('[/error]', '</span>', $content);
        $content = str_replace('[code=', '<p><pre><code class="language-', $content);
        $content = str_replace('[/code]', '</code></pre></p>', $content);
        $content = str_replace(']', '>', $content);
        $article->setContent($content);
        if (!$this->get('session')->has('lastSubjects')){
            $lastSubjects = array($article->getId(), 0, 0);
        } else {
            $lastSubjects = $this->get('session')->get('lastSubjects');
            $lastSubjects[2] = $lastSubjects[1];
            $lastSubjects[1] = $lastSubjects[0];
            $lastSubjects[0] = $article->getId();
        }
        $this->get('session')->set('lastSubjects', $lastSubjects);
        return $this->render('subject.html.twig', array('article' => $article, 'answers' => $answers));
    }

    /**
     * @route("/deconnexion/", name="disconnect")
     */
    public function disconnect(){
        if ($this->get('session')->has('account')){
            $this->get('session')->remove('account');
        } else {
            throw new AccessDeniedHttpException();
        }
        return $this->render('disconnect.html.twig');
    }

    /**
     * @route("/resultat/",  name="searchResults")
     */
    public function searchResult(Request $request){
        $search = $request->request->get('search');
        if(!preg_match('#^[a-z,.\-_\'\s]{2,50}$#i', $search)){
            $msg['SearchError'] = true;
            return $this->render('results.html.twig', array('msg' => $msg));
        } else {
            $keywords = explode(" ", $search);
            $search = '%';
            foreach($keywords as $keyword){
                $search = $search.$keyword.'%';
            }
            $repo = $this->getDoctrine()->getRepository(Subject::class);
            $articles = $repo->findByKeyWord($search);

            foreach($articles as $article){
                $letters = [];
                $title = strtolower($article->getTitle());
                foreach($keywords as $keyword){
                    if (strpos($title, strtolower($keyword)) !== false){
                        $title = str_replace(strtolower($keyword), '<mark>'. strtolower($keyword) .'</mark>', $title);
                    }
                }
                $article->setTitle($title);
            }
            if (empty($articles)){
                return $this->render('results.html.twig', array('msg' => false));
            }
            $this->get('session')->set('lastResearch', $search);
            return $this->render('results.html.twig', array('articles' => $articles));
        }
    }

    /**
     * @route("/administration/{type}/{page}", name="admin")
     */
    public function administration(Request $request, $type, $page){
        if (!$this->get('session')->has('account') || $this->get('session')->get('account')->getRank() < 2 || !$this->get('session')->has('tokenAdmin') || $this->get('session')->get('tokenAdmin') != $this->get('session')->get('account')->getToken()){
            throw new AccessDeniedHttpException();
        }
        $repo = $this->getDoctrine()->getRepository(User::class);
        if ($type == 'banned'){
            $users = $repo->findByStatusOffset(0);
        } else if($type == "moderator"){
            $users = $repo->findByTypeOffset(0);
        } else {
            $users = $repo->findAll();
        }
        if (!empty($users)){
            return $this->render('administration.html.twig', array('users' => $users));
        }
        return $this->render('administration.html.twig', array('vide' => true));
    }

    /**
     * @route("/creer-sujet/", name="createSubject")
     */
    public function createSubject(){
        if (!$this->get('session')->has('account')){
            throw new AccessDeniedHttpException();
        }
        return $this->render('createSubject.html.twig');
    }

    /**
     * @route("/activation/", name="activation")
     */
    public function activation(Request $request){
        $id = $request->query->get('id');
        $token = $request->query->get('token');
        $repo = $this->getDoctrine()->getRepository(User::class);
        $user = $repo->findOneById($id);
        if ($user != null){
            if ($token == $user->getToken()){
                $user->setActive(1);
                $em = $this->getDoctrine()->getManager();
                $em->merge($user);
                $em->flush();
                $msg['success'] = true;
            } else {
                throw new AccessDeniedHttpException();
            }
        } else {
            throw new AccessDeniedHttpException();
        }
        return $this->render('activation.html.twig', array('msg' => $msg));
    }

    /**
     * @route("/mot-de-passe-oublie/", name="resetPassword")
     */
    public function resetPassword(Request $request){
        $id = $request->query->get('id');
        $token = $request->query->get('token');
        $repo = $this->getDoctrine()->getRepository(User::class);
        $user = $repo->findOneById($id);
        if ($user == null){
            $msg['noUser'] = true;
        } else {
            if ($token != $user->getToken()){
                $msg['tokenDiff'] = true;
            } else {
                $msg['ok'] = $id;
            }
        }
        return $this->render('resetPassword.html.twig', array('msg' => $msg));
    }
}
