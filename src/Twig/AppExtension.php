<?php

namespace App\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class AppExtension extends AbstractExtension
{
    public function getFilters()
    {
        return array(
            new TwigFilter('truncate', array($this, 'truncate')),
        );
    }

    public function truncate($string)
    {
        $string = mb_substr($string, 0, 15).'...';

        return $string;
    }
}