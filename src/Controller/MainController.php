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
        return $this->render('index.html.twig');
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

        dump($this->get('session')->get('account'));
        if ($request->getMethod() == "POST"){
            $typeAccepted = array('image/png', 'image/jpeg', 'image/gif');
            $extensionPossible = array('png', 'jpeg', 'gif');
            $img = $request->files->get('img');

            if($img->getError() == 1 || $img->getError() == 2 || $img->getSize() > 1000000){
                $msg['fileBig'] = true;
            }
            if($img->getError() == 3){
                $msg['fileSend'] = true;
            }
            if($img->getError() == 6 || $img->getError() == 7 || $img->getError() == 8){
                $msg['fileServer'] = true;
            }
            if (!isset($msg)){
                $user = $this->get('session')->get('account');
                if (in_array($img->getMimeType(), $typeAccepted)){
                    $extension = $extensionPossible[array_keys($typeAccepted, $img->getMimeType())[0]];
                    $fileName = $user->getId().'-profil.'.$extension;
                    move_uploaded_file($img->getPathname(), '../public/img/'.$fileName);
                    $user->setImage('img/'.$fileName);
                    $em = $this->getDoctrine()->getManager();
                    $em->merge($user);
                    $em->flush();
                    $this->get('session')->get('account')->set('picture', 'img/'.$fileName);
                    $msg['success'] = true;
                }
            }
            return $this->render('profil.html.twig', array('msg' => $msg));
        }
        return $this->render('profil.html.twig');
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
        $content = str_replace('[code=', '<p><pre><code class="language-', $content);
        $content = str_replace('[/code]', '</code></pre></p>', $content);
        $content = str_replace(']', '>', $content);
        $article->setContent($content);
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
            return $this->render('results.html.twig', array('articles' => $articles));
        }
    }

    /**
     * @route("/administration/{type}/{page}", name="admin")
     */
    public function administration(Request $request, $type, $page){
        if (!$this->get('session')->has('account') || $this->get('session')->get('account')->getRank() < 2){
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
}