<?php

namespace App\Service;

class Recaptcha
{

    protected $keys;

    public function getKeys(){
        return $this->keys;
    }

    public function setKeys(array $newKeys){
        if(!isset($newKeys['publicKey']) || !isset($newKeys['privateKey'])){
            throw new \Exception('Clés invalides');
        }
        $this->keys = $newKeys;
    }

    public function __construct($keys)
    {
        $this->setKeys($keys);
    }

    /**
     * Méthode permettant de générer un captcha
     */
    // Remplacer les XXX par la clé secrète délivrée par Google
    public function recaptcha_valid($code, $ip = null)
        {
            if(empty($code)) {
                return false;
            }
            $params = [
                'secret'    => $this->getKeys()['privateKey'],
                'response'  => $code
            ];
            if($ip){
                $params['remoteip'] = $ip;
            }
            $url = "https://www.google.com/recaptcha/api/siteverify?" . http_build_query($params);
            if(function_exists('curl_version')){
                $curl = curl_init($url);
                curl_setopt($curl, CURLOPT_HEADER, false);
                curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($curl, CURLOPT_TIMEOUT, 10);
                curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
                $response = curl_exec($curl);
            }else{
                $response = file_get_contents($url);
            }
            if(empty($response) || is_null($response)){
                return false;
            }
            $json = json_decode($response);
            return $json->success;
        }

    public function Display(){
        return '<div class="form-group offset-4 col-6 g-recaptcha" data-sitekey="' . $this->getKeys()['publicKey'] . '"></div><br>';
    }
}