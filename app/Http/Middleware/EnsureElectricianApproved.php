<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureElectricianApproved
{
    /**
     * Electricians can take jobs only after an admin approved their application.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $electrician = $request->user()?->electrician;

        if ($electrician && ! $electrician->isApproved()) {
            return redirect()->route('electrician.application');
        }

        return $next($request);
    }
}
